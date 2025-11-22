import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TacGiaDocument = HydratedDocument<TacGia>;

@Schema({ timestamps: true })
export class TacGia {
  @Prop()
  tenTacGia: string;

  @Prop()
  quocTich: string;

  @Prop()
  namSinh: number;

  @Prop()
  namMat: number;

  @Prop()
  tieuSu: string;

  @Prop()
  butDanh: string;
}

export const TacGiaSchema = SchemaFactory.createForClass(TacGia);
