import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { VaiTro } from '../../vai-tro/schemas/vai-tro.schema';

export type NguoiDungDocument = HydratedDocument<NguoiDung>;

export enum TrangThaiNguoiDung {
  CHUA_KICH_HOAT = 0,
  DANG_HOAT_DONG = 1,
  BI_KHOA = 2,
}

@Schema({ timestamps: true })
export class NguoiDung {
  @Prop()
  hoVaTen: string;

  @Prop()
  hinhAnh: string;

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

  @Prop({ default: TrangThaiNguoiDung.DANG_HOAT_DONG })
  trangThai: number;

  @Prop()
  maOTP: string;

  @Prop()
  thoiHanOTP: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'VaiTro' })
  maVaiTro: VaiTro;

  @Prop()
  maFacebook: string;

  @Prop()
  maGoogle: string;

  @Prop({ default: 'local' })
  nguonDangNhap: string;
}

export const NguoiDungSchema = SchemaFactory.createForClass(NguoiDung);
