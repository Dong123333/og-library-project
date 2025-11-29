import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VaiTro } from './schemas/vai-tro.schema';

@Injectable()
export class VaiTroService {
  constructor(@InjectModel(VaiTro.name) private vaiTroModel: Model<VaiTro>) {}

  async findAll() {
    return await this.vaiTroModel.find().exec();
  }
}
