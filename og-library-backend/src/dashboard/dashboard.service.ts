import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sach } from '../modules/sach/schemas/sach.schema';
import { Model } from 'mongoose';
import { NguoiDung } from '../modules/nguoi-dung/schemas/nguoi-dung.schema';
import { MuonTra } from '../modules/muon-tra/schemas/muon-tra.schema';
import { PhieuPhat } from '../modules/phieu-phat/schemas/phieu-phat.schema';
import { ChiTietMuonTra } from '../modules/chi-tiet-muon-tra/schemas/chi-tiet-muon-tra.schema';
import { VaiTro } from '../modules/vai-tro/schemas/vai-tro.schema';
import { exec } from 'node:child_process';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Sach.name) private sachModel: Model<Sach>,
    @InjectModel(NguoiDung.name) private nguoiDungModel: Model<NguoiDung>,
    @InjectModel(MuonTra.name) private muonTraModel: Model<MuonTra>,
    @InjectModel(ChiTietMuonTra.name)
    private chiTietMuonTraModel: Model<ChiTietMuonTra>,
    @InjectModel(PhieuPhat.name) private phieuPhatModel: Model<PhieuPhat>,
    @InjectModel(VaiTro.name) private vaiTroModel: Model<VaiTro>,
  ) {}
  async getKpiStats() {
    const readerRole = await this.vaiTroModel.findOne({ maVaiTro: 'VT001' });
    const readerFilter = readerRole ? { maVaiTro: readerRole._id } : {};
    const [totalBooks, totalUsers, activeLoans, overdueBooks, revenueData] =
      await Promise.all([
        this.sachModel.countDocuments(),
        this.nguoiDungModel.countDocuments(readerFilter),
        this.muonTraModel.countDocuments({ trangThai: 2 }),
        this.chiTietMuonTraModel.countDocuments({
          tinhTrang: 1,
          ngayHenTra: { $lt: new Date() },
        }),

        this.phieuPhatModel.aggregate([
          { $match: { trangThai: true } },
          { $group: { _id: null, total: { $sum: '$soTien' } } },
        ]),
      ]);

    return {
      totalBooks,
      totalUsers,
      activeLoans,
      overdueBooks,
      totalRevenue: revenueData[0]?.total || 0
    };
  }

  async getChartData() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const borrowStats = await this.muonTraModel.aggregate([
      {
        $match: { ngayMuon: { $gte: sevenDaysAgo } },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$ngayMuon',
              timezone: '+07:00',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const returnStats = await this.chiTietMuonTraModel.aggregate([
      {
        $match: {
          ngayTra: { $gte: sevenDaysAgo },
          tinhTrang: 2,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$ngayTra',
              timezone: '+07:00',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return { borrowStats, returnStats };
  }

  async getRecentActivities() {
    const recentLoans = await this.muonTraModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('maNguoiDung', 'hoVaTen email')
      .select('_id ngayMuon ngayDangKy updatedAt maNguoiDung trangThai')
      .exec();

    const recentPenalties = await this.phieuPhatModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('maNguoiDung', 'hoVaTen email')
      .populate('maSach', 'tenSach')
      .select('_id soTien lyDo ngayLap updatedAt maNguoiDung maSach trangThai')
      .exec();

    return { recentLoans, recentPenalties };
  }
}
