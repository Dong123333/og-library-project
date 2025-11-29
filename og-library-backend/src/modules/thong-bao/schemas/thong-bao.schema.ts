import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NguoiDung } from '../../nguoi-dung/schemas/nguoi-dung.schema';

export type ThongBaoDocument = HydratedDocument<ThongBao>;

@Schema({ timestamps: true })
export class ThongBao {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' })
  maNguoiDung: NguoiDung;

  @Prop()
  loaiThongBao: string;

  @Prop()
  tieuDe: string;

  @Prop()
  noiDung: string;

  @Prop()
  lienKet: string;

  @Prop({ default: false })
  daXem: boolean;
}

export const ThongBaoSchema = SchemaFactory.createForClass(ThongBao);
