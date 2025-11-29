import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MuonTra } from '../../muon-tra/schemas/muon-tra.schema';
import { Sach } from '../../sach/schemas/sach.schema';

export type ChiTietMuonTraDocument = HydratedDocument<ChiTietMuonTra>;

export enum TrangThaiSach {
  DANG_MUON = 0,
  DA_TRA = 1,
  MAT_OR_HONG = 2,
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

  @Prop({ type: Number, enum: TrangThaiSach, default: TrangThaiSach.DANG_MUON })
  tinhTrang: number;
}

export const ChiTietMuonTraSchema =
  SchemaFactory.createForClass(ChiTietMuonTra);
