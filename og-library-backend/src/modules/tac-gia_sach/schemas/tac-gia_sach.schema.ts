import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { TacGia } from '../../tac-gia/schemas/tac-gia.schema';
import { Sach } from '../../sach/schemas/sach.schema';

export type TacGia_SachDocument = HydratedDocument<TacGia_Sach>;

@Schema({ timestamps: true })
export class TacGia_Sach {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TacGia' })
  maTacGia: TacGia;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sach' })
  maSach: Sach;
}

export const TacGia_SachSchema = SchemaFactory.createForClass(TacGia_Sach);
