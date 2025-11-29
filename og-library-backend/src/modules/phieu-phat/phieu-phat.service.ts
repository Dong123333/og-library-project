import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhieuPhatDto } from './dto/create-phieu-phat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PhieuPhat } from './schemas/phieu-phat.schema';
import { ClientSession, Model } from 'mongoose';
import { ThongBaoService } from '../thong-bao/thong-bao.service';

@Injectable()
export class PhieuPhatService {
  constructor(
    @InjectModel(PhieuPhat.name) private phieuPhatModel: Model<PhieuPhat>,
    private thongBaoService: ThongBaoService,
  ) {}

  async create(createDto: CreatePhieuPhatDto, session?: ClientSession) {
    const newPhieu = new this.phieuPhatModel({
      ...createDto,
      trangThai: false,
    });

    const savedPhieu = session
      ? await newPhieu.save({ session })
      : await newPhieu.save();

    try {
      await this.thongBaoService.create({
        maNguoiDung: createDto.maNguoiDung,
        loaiThongBao: 'READER',
        tieuDe: 'Thông báo vi phạm',
        noiDung: `Bạn có một phiếu phạt mới: ${createDto.soTien.toLocaleString()}đ. Lý do: ${createDto.lyDo}`,
        lienKet: '/loans#penalties',
      });
    } catch (err) {
      console.error('Lỗi gửi thông báo phạt:', err);
    }

    return savedPhieu;
  }

  async findAll() {
    return await this.phieuPhatModel
      .find()
      .populate('maNguoiDung', 'hoVaTen email')
      .populate('maSach', 'tenSach hinhAnh')
      .populate('maMuonTra')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string) {
    return await this.phieuPhatModel
      .find({ maNguoiDung: userId })
      .populate('maSach', 'tenSach hinhAnh')
      .populate('maMuonTra')
      .sort({ createdAt: -1 })
      .exec();
  }

  async confirmPayment(id: string) {
    const phieu = await this.phieuPhatModel.findById(id);
    if (!phieu) throw new NotFoundException('Không tìm thấy phiếu phạt');
    phieu.trangThai = true;
    return await phieu.save();
  }

  async markAsPaid(id: string) {
    const phieu = await this.phieuPhatModel.findByIdAndUpdate(
      id,
      { trangThai: true },
      { new: true },
    ).populate('maNguoiDung');

    if (phieu) {
      const user = phieu.maNguoiDung as any;
      const soTienFormat = phieu.soTien.toLocaleString('vi-VN');

      await this.thongBaoService.create({
        maNguoiDung: user._id,
        loaiThongBao: 'READER',
        tieuDe: 'Thanh toán thành công',
        noiDung: `Phiếu phạt ${soTienFormat}đ đã được thanh toán. Cảm ơn bạn!`,
        lienKet: '/loans#penalties',
      });

      await this.thongBaoService.create({
        loaiThongBao: 'LIBRARIAN',
        tieuDe: '💰 Tiền phạt đã được đóng',
        noiDung: `Độc giả ${user.hoVaTen} vừa thanh toán khoản phạt ${soTienFormat}đ.`,
        lienKet: '/librarian/penalties',
      });
    }
    return phieu;
  }

  async overdueTicket(userId: string) {
    const deadlineLimit = new Date();
    deadlineLimit.setDate(deadlineLimit.getDate() - 7);

    const phieuPhatQuaHan = await this.phieuPhatModel.findOne({
      maNguoiDung: userId,
      trangThai: false,
      ngayLap: { $lt: deadlineLimit },
    });

    return phieuPhatQuaHan;
  }
}
