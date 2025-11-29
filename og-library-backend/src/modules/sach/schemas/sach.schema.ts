import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DanhMuc } from '../../danh-muc/schemas/danh-muc.schema';
import { TacGia } from '../../tac-gia/schemas/tac-gia.schema';
import { NhaXuatBan } from '../../nha-xuat-ban/schemas/nha-xuat-ban.schema';

export type SachDocument = HydratedDocument<Sach>;

@Schema({ timestamps: true })
export class Sach {
  @Prop()
  tenSach: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DanhMuc' })
  maDanhMuc: DanhMuc;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TacGia' }] })
  maTacGia: TacGia[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NhaXuatBan' })
  maNhaXuatBan: NhaXuatBan;

  @Prop()
  namXuatBan: number;

  @Prop()
  soLuong: number;

  @Prop()
  hinhAnh: string;

  @Prop({ default: 0 })
  giaTien: number;
}

export const SachSchema = SchemaFactory.createForClass(Sach);
