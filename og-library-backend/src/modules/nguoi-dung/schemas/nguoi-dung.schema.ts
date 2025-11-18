import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { VaiTro } from '../../vai-tro/schemas/vai-tro.schema';

export type NguoiDungDocument = HydratedDocument<NguoiDung>;

@Schema({ timestamps: true })
export class NguoiDung {
  @Prop()
  maNguoiDung: string;

  @Prop()
  tenNguoiDung: string;

  @Prop()
  ngaySinh: Date;

  @Prop()
  diaChi: string;

  @Prop()
  soDienThoai: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  matKhau: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'VaiTro' })
  maVaiTro: VaiTro;
}

export const NguoiDungSchema = SchemaFactory.createForClass(NguoiDung);
