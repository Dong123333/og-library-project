import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MuonTra } from '../../muon-tra/schemas/muon-tra.schema';
import { Sach } from '../../sach/schemas/sach.schema';
import { NguoiDung } from '../../nguoi-dung/schemas/nguoi-dung.schema';

export type PhieuPhatDocument = HydratedDocument<PhieuPhat>;

@Schema({ timestamps: true })
export class PhieuPhat {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MuonTra' })
  maMuonTra: MuonTra;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sach' })
  maSach: Sach;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' })
  maNguoiDung: NguoiDung;

  @Prop()
  lyDo: string;

  @Prop()
  soTien: number;

  @Prop()
  ngayLap: Date;

  @Prop({ default: false })
  trangThai: boolean;
}

export const PhieuPhatSchema = SchemaFactory.createForClass(PhieuPhat);
