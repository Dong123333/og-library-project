import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateMuonTraDto,
  GiaHanSachDto,
  ReturnBookDto,
} from './dto/create-muon-tra.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { MuonTra, TrangThaiPhieu } from './schemas/muon-tra.schema';
import { ChiTietMuonTra } from '../chi-tiet-muon-tra/schemas/chi-tiet-muon-tra.schema';
import { Sach } from '../sach/schemas/sach.schema';
import { PhieuPhatService } from '../phieu-phat/phieu-phat.service';
import { ThongBaoService } from '../thong-bao/thong-bao.service';
import aqp from 'api-query-params';
import { NguoiDung } from '../nguoi-dung/schemas/nguoi-dung.schema';
import { convertToRegex } from '../../helpers/regex.util';
import dayjs from 'dayjs';

@Injectable()
export class MuonTraService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MuonTra.name) private muonTraModel: Model<MuonTra>,
    @InjectModel(ChiTietMuonTra.name)
    private chiTietMuonTraModel: Model<ChiTietMuonTra>,
    @InjectModel(Sach.name) private sachModel: Model<Sach>,
    @InjectModel(NguoiDung.name) private nguoiDungModel: Model<NguoiDung>,
    private phieuPhatService: PhieuPhatService,
    private thongBaoService: ThongBaoService,
  ) {}

  async register(_id: string, createMuonTraDto: CreateMuonTraDto) {
    const { items, ngayHenTra, ghiChu } = createMuonTraDto;

    const phieuPhatQuaHan = await this.phieuPhatService.overdueTicket(_id);

    if (phieuPhatQuaHan) {
      throw new BadRequestException(
        'Bạn đang có phiếu phạt quá hạn chưa đóng. Vui lòng thanh toán trước khi mượn tiếp.',
      );
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('Giỏ sách trống!');
    }

    const tongSoLuong = items.reduce((sum, item) => sum + item.soLuongMuon, 0);

    if (tongSoLuong > 10) {
      throw new BadRequestException(
        `Bạn chỉ được mượn tối đa 10 cuốn cùng lúc! (Hiện tại: ${tongSoLuong})`,
      );
    }

    const requestDate = new Date(ngayHenTra);
    const today = new Date();

    if (requestDate < today) {
      throw new BadRequestException(
        'Ngày hẹn trả không hợp lệ (Không được chọn ngày quá khứ)',
      );
    }

    const maxDate = new Date();
    if (tongSoLuong <= 5) {
      maxDate.setDate(maxDate.getDate() + 30);
    } else {
      maxDate.setDate(maxDate.getDate() + 7);
    }

    if (requestDate.getTime() > maxDate.getTime() + 86400000) {
      throw new BadRequestException(
        `Với ${tongSoLuong} cuốn, bạn chỉ được mượn tối đa đến ${maxDate.toLocaleDateString('vi-VN')}`,
      );
    }

    const phieu = await this.muonTraModel.create({
      maNguoiDung: _id,
      ghiChu: ghiChu,
      trangThai: 0,
      ngayDangKy: new Date(),
      ngayMuon: null,
    });

    for (const item of items) {
      await this.chiTietMuonTraModel.create({
        maMuonTra: phieu._id,
        maSach: item.maSach,
        soLuongMuon: item.soLuongMuon,
        tinhTrang: 0,
        ngayHenTra: requestDate,
        giaHan: false,
      });

      await this.sachModel.findByIdAndUpdate(item.maSach, {
        $inc: { soLuong: -item.soLuongMuon },
      });
    }

    await this.thongBaoService.create({
      loaiThongBao: 'LIBRARIAN',
      tieuDe: 'Yêu cầu mượn sách mới',
      noiDung: 'Có độc giả vừa đăng ký mượn sách. Vui lòng kiểm tra.',
      lienKet: '/librarian/loans',
    });

    return phieu;
  }

  async approve(id: string, ghiChu: string) {
    const phieu = await this.muonTraModel.findById(id);
    if (!phieu) {
      throw new NotFoundException('Phiếu không tồn tại');
    }

    let updatedNote = phieu.ghiChu || '';
    if (ghiChu) {
      updatedNote += `\n[Thủ thư nhắn]: ${ghiChu}`;
    }

    phieu.trangThai = 1;
    phieu.ghiChu = updatedNote;

    await this.thongBaoService.create({
      maNguoiDung: phieu.maNguoiDung,
      loaiThongBao: 'READER',
      tieuDe: 'Yêu cầu đã được duyệt',
      noiDung: 'Sách đã sẵn sàng. Bạn vui lòng đến thư viện để nhận.',
      lienKet: '/loans',
    });

    return await phieu.save();
  }

  async pickup(id: string) {
    const ngayMuon = new Date();
    await this.muonTraModel.findByIdAndUpdate(id, {
      trangThai: 2,
      ngayMuon: ngayMuon,
    });

    await this.chiTietMuonTraModel.updateMany(
      { maMuonTra: id },
      { tinhTrang: 1 },
    );

    return { message: 'Đã giao sách cho khách' };
  }

  async returnDetail(detailId: string, returnBookDto: ReturnBookDto) {
    const soLuongTra = Number(returnBookDto.soLuongTra);

    if (isNaN(soLuongTra) || soLuongTra < 1) {
      throw new BadRequestException(
        `Số lượng trả không hợp lệ: ${returnBookDto.soLuongTra}`,
      );
    }

    const tienPhat = returnBookDto.tienPhat
      ? Number(returnBookDto.tienPhat)
      : 0;

    const detail = await this.chiTietMuonTraModel
      .findById(detailId)
      .populate('maMuonTra')
      .populate('maSach');
    if (!detail) throw new NotFoundException('Không tìm thấy phiếu');

    const currentPaid = Number(detail.soLuongDaTra) || 0;
    const totalBorrow = Number(detail.soLuongMuon) || 1;

    const conNo = totalBorrow - currentPaid;
    if (soLuongTra > conNo) {
      throw new BadRequestException(
        `Khách chỉ nợ ${conNo} cuốn. Không thể trả ${soLuongTra} cuốn.`,
      );
    }

    try {
      detail.soLuongDaTra = currentPaid + soLuongTra;
      detail.ngayTra = new Date();
      if (detail.soLuongDaTra === totalBorrow) {
        detail.tinhTrang = 2;
      }
      await detail.save();

      await this.sachModel.findByIdAndUpdate(detail.maSach, {
        $inc: { soLuong: +soLuongTra },
      });

      const ngayHienTai = new Date();

      if (tienPhat && tienPhat > 0) {
        const parentLoan = detail.maMuonTra as any;
        await this.phieuPhatService.create({
          maNguoiDung: parentLoan.maNguoiDung,
          maMuonTra: parentLoan._id,
          maSach: (detail.maSach as any)._id,
          soTien: tienPhat,
          ngayLap: ngayHienTai,
          lyDo: returnBookDto.lyDoPhat || 'Phạt vi phạm',
          trangThai: false,
        });
      }

      const parentId = (detail.maMuonTra as any)._id;

      const pending = await this.chiTietMuonTraModel.countDocuments({
        maMuonTra: parentId,
        tinhTrang: 1,
      });

      if (pending === 0) {
        await this.muonTraModel.findByIdAndUpdate(parentId, { trangThai: 3 });
      } else {
        await this.muonTraModel.findByIdAndUpdate(parentId, { trangThai: 2 });
      }

      await this.thongBaoService.create({
        maNguoiDung: (detail.maMuonTra as any).maNguoiDung,
        loaiThongBao: 'READER',
        tieuDe: 'Trả sách thành công',
        noiDung: `Bạn đã trả ${soLuongTra} cuốn "${(detail.maSach as any).tenSach}". Cảm ơn bạn đã sử dụng dịch vụ thư viện.`,
        lienKet: '/loans',
      });

      return {
        message: 'Trả sách thành công',
        warning: (tienPhat ?? 0) > 0 ? `Đã tạo phiếu phạt: ${tienPhat}đ` : null,
      };
    } catch (error) {
      throw error;
    }
  }

  async cancel(id: string, user: any) {
    try {
      const phieu = await this.muonTraModel.findById(id);
      if (!phieu) {
        throw new NotFoundException('Phiếu mượn không tồn tại');
      }

      const isOwner = phieu.maNguoiDung.toString() === user._id.toString();
      const isAdmin = user.maVaiTro.maVaiTro === 'VT002';

      if (!isOwner && !isAdmin) {
        throw new BadRequestException('Bạn không có quyền hủy phiếu này');
      }

      if (!isAdmin && phieu.trangThai !== 0) {
        throw new BadRequestException(
          'Chỉ có thể hủy phiếu khi đang chờ duyệt',
        );
      }

      if (phieu.trangThai >= 2) {
        throw new BadRequestException(
          'Phiếu đang mượn hoặc đã hoàn tất, không thể hủy.',
        );
      }

      phieu.trangThai = 4;
      await phieu.save();

      if (isAdmin) {
        await this.thongBaoService.create({
          maNguoiDung: phieu.maNguoiDung.toString(),
          loaiThongBao: 'READER',
          tieuDe: 'Yêu cầu mượn sách bị hủy',
          noiDung: `Yêu cầu ${phieu._id.toString().slice(-6)} đã bị hủy.`,
          lienKet: '/loans',
        });
      } else {
        await this.thongBaoService.create({
          loaiThongBao: 'LIBRARIAN',
          tieuDe: 'Độc giả đã hủy yêu cầu',
          noiDung: `Độc giả ${user.hoVaTen} đã hủy phiếu mượn ${phieu._id.toString().slice(-6)}.`,
          lienKet: '/librarian/loans',
        });
      }

      const details = await this.chiTietMuonTraModel.find({ maMuonTra: id });

      await this.chiTietMuonTraModel.updateMany(
        { maMuonTra: id },
        { tinhTrang: 3 },
      );

      for (const detail of details) {
        await this.sachModel.findByIdAndUpdate(detail.maSach, {
          $inc: { soLuong: +detail.soLuongMuon },
        });
      }

      return { message: 'Hủy yêu cầu thành công' };
    } catch (error) {
      throw error;
    }
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort } = aqp(query);
    delete filter.page;
    delete filter.limit;
    delete filter.current;
    delete filter.pageSize;

    if (
      filter.trangThai !== undefined &&
      filter.trangThai !== null &&
      filter.trangThai !== ''
    ) {
      filter.trangThai = Number(filter.trangThai);
    }

    const keyword = filter.keyword;
    delete filter.keyword;

    if (keyword) {
      const regexString = convertToRegex(keyword);
      const regex = { $regex: regexString, $options: 'i' };
      const users = await this.nguoiDungModel
        .find({
          $or: [{ hoVaTen: regex }, { email: regex }],
        })
        .select('_id');

      const userIds = users.map((u) => u._id);

      const keywordString = String(keyword);

      filter['$or'] = [
        { maNguoiDung: { $in: userIds } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: keywordString,
              options: 'i',
            },
          },
        },
      ];
    }
    const sortOption = sort || { createdAt: -1 };
    const defaultLimit = limit ? limit : 10;
    const offset = (currentPage - 1) * defaultLimit;

    const totalItems = await this.muonTraModel.countDocuments(filter);

    const result = await this.muonTraModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sortOption as any)
      .populate('maNguoiDung', 'hoVaTen email soDienThoai')
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: Math.ceil(totalItems / defaultLimit),
        total: totalItems,
      },
      result,
    };
  }

  async findDetails(loanId: string) {
    return await this.chiTietMuonTraModel
      .find({ maMuonTra: loanId })
      .populate('maSach', 'tenSach hinhAnh giaTien')
      .populate('maMuonTra')
      .exec();
  }

  async getHistoryByUser(currentPage: number, limit: number, userId: string) {
    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = await this.muonTraModel.countDocuments({
      maNguoiDung: userId,
    });

    const result = await this.muonTraModel
      .find({ maNguoiDung: userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(defaultLimit)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: Math.ceil(totalItems / defaultLimit),
        total: totalItems,
      },
      result,
    };
  }

  async getTrendingBooks(limit = 6) {
    const topBooks = await this.chiTietMuonTraModel.aggregate([
      {
        $group: {
          _id: '$maSach',
          totalBorrowed: { $sum: '$soLuongMuon' },
        },
      },
      { $sort: { totalBorrowed: -1 } },
      { $limit: limit },
    ]);

    const bookIds = topBooks.map((t) => t._id);

    const books = await this.sachModel
      .find({ _id: { $in: bookIds } })
      .populate('maTacGia', 'tenTacGia')
      .populate('maDanhMuc', 'tenDanhMuc')
      .lean()
      .exec();

    const result = topBooks
      .map((t) => {
        const bookInfo = books.find(
          (b) => b._id.toString() === t._id.toString(),
        );

        if (bookInfo) {
          return {
            ...bookInfo,
            totalBorrowed: t.totalBorrowed,
          };
        }
        return null;
      })
      .filter((b) => b !== null);

    return result;
  }

  async getSmartRecommendedBooks(userId: string, limit = 6) {
    const userObjectId = new Types.ObjectId(userId);

    const borrowedHistory = await this.muonTraModel.aggregate([
      { $match: { maNguoiDung: userObjectId } },
      {
        $lookup: {
          from: 'chitietmuontras',
          localField: '_id',
          foreignField: 'maMuonTra',
          as: 'details',
        },
      },
      { $unwind: '$details' },
      {
        $group: {
          _id: null,
          borrowedBookIds: { $addToSet: '$details.maSach' },
        },
      },
    ]);

    const excludeIds =
      borrowedHistory.length > 0 ? borrowedHistory[0].borrowedBookIds : [];

    const favoriteCategory = await this.muonTraModel.aggregate([
      { $match: { maNguoiDung: userObjectId } },
      {
        $lookup: {
          from: 'chitietmuontras',
          localField: '_id',
          foreignField: 'maMuonTra',
          as: 'details',
        },
      },
      { $unwind: '$details' },
      {
        $lookup: {
          from: 'saches',
          localField: 'details.maSach',
          foreignField: '_id',
          as: 'bookInfo',
        },
      },
      { $unwind: '$bookInfo' },
      {
        $group: {
          _id: '$bookInfo.maDanhMuc',
          count: { $sum: '$details.soLuongMuon' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let recommendedBooks: any[] = [];

    if (favoriteCategory.length > 0) {
      const topCategoryId = favoriteCategory[0]._id;
      recommendedBooks = await this.sachModel
        .find({
          maDanhMuc: topCategoryId,
          _id: { $nin: excludeIds },
          soLuong: { $gt: 0 },
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('maTacGia', 'tenTacGia')
        .populate('maDanhMuc', 'tenDanhMuc')
        .lean()
        .exec();
    }

    if (recommendedBooks.length === 0) {
      const topBooksExclude = await this.chiTietMuonTraModel.aggregate([
        {
          $match: {
            maSach: { $nin: excludeIds },
          },
        },
        {
          $group: {
            _id: '$maSach',
            totalBorrowed: { $sum: '$soLuongMuon' },
          },
        },
        { $sort: { totalBorrowed: -1 } },
        { $limit: limit },
      ]);

      if (topBooksExclude.length === 0) {
        return [];
      }

      const bookIds = topBooksExclude.map((t) => t._id);
      const booksInfo = await this.sachModel
        .find({ _id: { $in: bookIds } })
        .populate('maTacGia', 'tenTacGia')
        .populate('maDanhMuc', 'tenDanhMuc')
        .lean()
        .exec();

      recommendedBooks = topBooksExclude
        .map((t) => {
          const book = booksInfo.find(
            (b) => b._id.toString() === t._id.toString(),
          );
          return book ? { ...book, totalBorrowed: t.totalBorrowed } : null;
        })
        .filter((b) => b);
    }

    return recommendedBooks;
  }

  async getTopReadersThisMonth(limit = 5) {
    const now = new Date();
    const displayMonth = now.getMonth() + 1;
    const displayYear = now.getFullYear();

    const filterMonth = displayMonth - 1;
    const startOfMonth = new Date(displayYear, filterMonth, 1);
    const endOfMonth = new Date(
      displayYear,
      filterMonth + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return this.muonTraModel.aggregate([
      {
        $match: {
          ngayMuon: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
          trangThai: 3,
        },
      },

      {
        $lookup: {
          from: 'chitietmuontras',
          localField: '_id',
          foreignField: 'maMuonTra',
          as: 'details',
        },
      },
      { $unwind: '$details' },

      {
        $group: {
          _id: '$maNguoiDung',
          totalBorrowed: { $sum: '$details.soLuongMuon' },
        },
      },
      { $sort: { totalBorrowed: -1 } },
      { $limit: limit },

      {
        $lookup: {
          from: 'nguoidungs',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },

      {
        $project: {
          _id: 1,
          totalBorrowed: 1,
          hoTen: '$userInfo.hoVaTen',
          email: '$userInfo.email',
          thang: { $literal: displayMonth },
          nam: { $literal: displayYear },
        },
      },
    ]);
  }

  async getStatistics() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [total, today, pending, overdue] = await Promise.all([
      this.muonTraModel.countDocuments(),

      this.muonTraModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),

      this.muonTraModel.countDocuments({
        trangThai: TrangThaiPhieu.CHO_DUYET,
      }),

      this.chiTietMuonTraModel.countDocuments({
        tinhTrang: 1,
        ngayHenTra: { $lt: new Date() },
      }),
    ]);

    return {
      total,
      today,
      pending,
      overdue,
    };
  }

  async renewBook(_id: string, dto: GiaHanSachDto) {
    const { maMuonTra, maSach, ngayHenTraMoi } = dto;
    const ngayMoi = dayjs(ngayHenTraMoi);

    const phieuMuon = await this.muonTraModel.findOne({
      _id: maMuonTra,
      maNguoiDung: _id,
    });

    if (!phieuMuon) {
      throw new NotFoundException('Không tìm thấy thông tin phiếu mượn');
    }

    if (phieuMuon.trangThai !== 2) {
      throw new BadRequestException(
        'Chỉ có thể gia hạn khi phiếu mượn đang ở trạng thái "Đang mượn"',
      );
    }

    const chiTiet = await this.chiTietMuonTraModel.findOne({
      maMuonTra,
      maSach,
    });

    if (!chiTiet) {
      throw new NotFoundException(
        'Không tìm thấy sách này trong chi tiết phiếu mượn',
      );
    }

    chiTiet.ngayHenTra = ngayMoi.toDate();
    chiTiet.giaHan = true;
    await chiTiet.save();
    await this.thongBaoService.create({
      loaiThongBao: 'LIBRARIAN',
      tieuDe: 'Gia hạn mượn sách',
      noiDung: 'Có độc giả vừa gia hạn mượn sách. Vui lòng kiểm tra.',
      lienKet: '/librarian/loans',
    });
    return { message: 'Gia hạn thành công' };
  }
}
