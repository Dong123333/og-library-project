import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NguoiDung } from '../../nguoi-dung/schemas/nguoi-dung.schema';

export type MuonTraDocument = HydratedDocument<MuonTra>;

export enum TrangThaiPhieu {
  CHO_DUYET = 0,
  CHO_LAY = 1,
  DANG_MUON = 2,
  DA_TRA_HET = 3,
  DA_HUY = 4,
}

@Schema({ timestamps: true })
export class MuonTra {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' })
  maNguoiDung: NguoiDung;

  @Prop({ default: Date.now })
  ngayDangKy: Date;

  @Prop()
  ngayMuon: Date;

  @Prop()
  ghiChu: string;

  @Prop({
    type: Number,
    enum: TrangThaiPhieu,
    default: TrangThaiPhieu.CHO_DUYET,
  })
  trangThai: number;
}

export const MuonTraSchema = SchemaFactory.createForClass(MuonTra);
