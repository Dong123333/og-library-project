import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NhaXuatBanDocument = HydratedDocument<NhaXuatBan>;

@Schema({ timestamps: true })
export class NhaXuatBan {
  @Prop()
  tenNhaXuatBan: string;

  @Prop()
  diaChi: string;
}

export const NhaXuatBanSchema = SchemaFactory.createForClass(NhaXuatBan);
