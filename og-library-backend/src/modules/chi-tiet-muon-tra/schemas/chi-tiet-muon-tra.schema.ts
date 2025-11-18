import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MuonTra } from '../../muon-tra/schemas/muon-tra.schema';
import { Sach } from '../../sach/schemas/sach.schema';

export type ChiTietMuonTraDocument = HydratedDocument<ChiTietMuonTra>;

@Schema({ timestamps: true })
export class ChiTietMuonTra {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MuonTra' })
  maMuonTra: MuonTra;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sach' })
  maSach: Sach;

  @Prop()
  soLuongMuon: number;

  @Prop()
  ngayTra: Date;

  @Prop()
  tinhTrang: number;
}

export const ChiTietMuonTraSchema = SchemaFactory.createForClass(ChiTietMuonTra);
