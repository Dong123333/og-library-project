import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DanhMuc } from '../../danh-muc/schemas/danh-muc.schema';
import { TacGia } from '../../tac-gia/schemas/tac-gia.schema';
import { NhaXuatBan } from '../../nha-xuat-ban/schemas/nha-xuat-ban.schema';

export type SachDocument = HydratedDocument<Sach>;

@Schema({ timestamps: true })
export class Sach {
  @Prop()
  maSach: string;

  @Prop()
  tenSach: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DanhMuc' })
  maDanhMuc: DanhMuc;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TacGia' })
  maTacGia: TacGia;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NhaXuatBan' })
  maNhaXuatBan: NhaXuatBan;

  @Prop()
  namXuatBan: string;

  @Prop()
  soLuong: string;

  @Prop()
  hinhAnh: string;
}

export const SachSchema = SchemaFactory.createForClass(Sach);
