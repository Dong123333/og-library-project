import { Injectable } from '@nestjs/common';
import { CreateTacGiaDto } from './dto/create-tac-gia.dto';
import { UpdateTacGiaDto } from './dto/update-tac-gia.dto';
import { TacGia } from './schemas/tac-gia.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TacGiaService {
  constructor(@InjectModel(TacGia.name) private tacGiaModel: Model<TacGia>) {}

  async create(createTacGiaDto: CreateTacGiaDto) {
    return await this.tacGiaModel.create(createTacGiaDto);
  }

  async findAll() {
    return await this.tacGiaModel.find().exec();
  }

  async findOne(id: string) {
    return await this.tacGiaModel.findById(id);
  }

  async update(id: string, updateTacGiaDto: UpdateTacGiaDto) {
    return await this.tacGiaModel.findByIdAndUpdate(id, updateTacGiaDto, { new: true });
  }

  async remove(id: string) {
    return await this.tacGiaModel.findByIdAndDelete(id);
  }
}
