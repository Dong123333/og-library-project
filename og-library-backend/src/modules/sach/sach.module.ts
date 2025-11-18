import { Module } from '@nestjs/common';
import { SachService } from './sach.service';
import { SachController } from './sach.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sach, SachSchema } from './schemas/sach.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sach.name, schema: SachSchema }]),
  ],
  controllers: [SachController],
  providers: [SachService],
})
export class SachModule {}
