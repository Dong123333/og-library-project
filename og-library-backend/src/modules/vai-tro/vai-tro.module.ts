import { Module } from '@nestjs/common';
import { VaiTroService } from './vai-tro.service';
import { VaiTroController } from './vai-tro.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VaiTro, VaiTroSchema } from './schemas/vai-tro.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VaiTro.name, schema: VaiTroSchema }]),
  ],
  controllers: [VaiTroController],
  providers: [VaiTroService],
})
export class VaiTroModule {}
