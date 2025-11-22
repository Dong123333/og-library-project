import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DanhMucDocument = HydratedDocument<DanhMuc>;

@Schema({ timestamps: true })
export class DanhMuc {
  @Prop()
  tenDanhMuc: string;

  @Prop()
  moTa: string;
}

export const DanhMucSchema = SchemaFactory.createForClass(DanhMuc);
