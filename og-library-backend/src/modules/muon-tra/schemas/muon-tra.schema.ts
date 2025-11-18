import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NguoiDung } from '../../nguoi-dung/schemas/nguoi-dung.schema';

export type MuonTraDocument = HydratedDocument<MuonTra>;

@Schema({ timestamps: true })
export class MuonTra {
  @Prop()
  maMuonTra: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' })
  maNguoiDung: NguoiDung;

  @Prop()
  ngayMuon: Date;

  @Prop()
  ngayHenTra: Date;

  @Prop()
  tinhTrang: number;
}

export const MuonTraSchema = SchemaFactory.createForClass(MuonTra);
