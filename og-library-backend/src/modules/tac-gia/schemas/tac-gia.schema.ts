import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TacGiaDocument = HydratedDocument<TacGia>;

@Schema({ timestamps: true })
export class TacGia {
  @Prop()
  maTacGia: string;

  @Prop()
  tenTacGia: string;

  @Prop()
  quocTich: string;

  @Prop()
  ngaySinh: Date;

  @Prop()
  ngayMat: Date;

  @Prop()
  tieuSu: string;

  @Prop()
  butDanh: string;
}

export const TacGiaSchema = SchemaFactory.createForClass(TacGia);
