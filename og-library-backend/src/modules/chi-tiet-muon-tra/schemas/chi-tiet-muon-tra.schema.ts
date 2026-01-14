import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MuonTra } from '../../muon-tra/schemas/muon-tra.schema';
import { Sach } from '../../sach/schemas/sach.schema';

export type ChiTietMuonTraDocument = HydratedDocument<ChiTietMuonTra>;

export enum TrangThaiSach {
  CHO_LAY = 0,
  DANG_MUON = 1,
  DA_TRA = 2,
  DA_HUY = 3,
}

@Schema({ timestamps: true })
export class ChiTietMuonTra {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MuonTra' })
  maMuonTra: MuonTra;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sach' })
  maSach: Sach;

  @Prop()
  soLuongMuon: number;

  @Prop()
  soLuongDaTra: number;

  @Prop()
  ngayHenTra: Date;

  @Prop()
  ngayTra: Date;

  @Prop({ default: false })
  giaHan: boolean;

  @Prop({ type: Number, enum: TrangThaiSach, default: TrangThaiSach.CHO_LAY })
  tinhTrang: number;
}

export const ChiTietMuonTraSchema =
  SchemaFactory.createForClass(ChiTietMuonTra);
