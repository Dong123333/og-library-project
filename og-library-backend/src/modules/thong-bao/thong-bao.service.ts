import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ThongBao } from './schemas/thong-bao.schema';
import { Model } from 'mongoose';

@Injectable()
export class ThongBaoService {
  constructor(
    @InjectModel(ThongBao.name) private thongBaoModel: Model<ThongBao>,
  ) {}

  async create(data: any) {
    return await this.thongBaoModel.create(data);
  }

  async findAll(userId: string, role: string) {
    let filter = {};

    if (role === 'VT002') {
      filter = { loaiThongBao: 'LIBRARIAN' };
    } else {
      filter = { maNguoiDung: userId, loaiThongBao: 'READER' };
    }

    return await this.thongBaoModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async markAsRead(id: string) {
    return await this.thongBaoModel.findByIdAndUpdate(id, { daXem: true });
  }

  async markAllRead(userId: string, role: string) {
    const filter = (role === 'VT002')
        ? { loaiThongBao: 'LIBRARIAN' }
        : { maNguoiDung: userId, loaiThongBao: 'READER' };

    return await this.thongBaoModel.updateMany(
      { ...filter, daXem: false },
      { daXem: true },
    );
  }
}
