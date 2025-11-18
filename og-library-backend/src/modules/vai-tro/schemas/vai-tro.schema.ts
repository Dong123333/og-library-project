import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VaiTroDocument = HydratedDocument<VaiTro>;

@Schema({ timestamps: true })
export class VaiTro {
  @Prop()
  maVaiTro: string;

  @Prop()
  tenVaiTro: string;

  @Prop()
  moTa: string;
}

export const VaiTroSchema = SchemaFactory.createForClass(VaiTro);
