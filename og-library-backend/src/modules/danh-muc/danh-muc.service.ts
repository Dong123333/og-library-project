import { Injectable } from '@nestjs/common';
import { CreateDanhMucDto } from './dto/create-danh-muc.dto';
import { UpdateDanhMucDto } from './dto/update-danh-muc.dto';
import { InjectModel } from '@nestjs/mongoose';
import { DanhMuc } from './schemas/danh-muc.schema';
import { Model } from 'mongoose';

@Injectable()
export class DanhMucService {
  constructor(
    @InjectModel(DanhMuc.name) private danhMucModel: Model<DanhMuc>,
  ) {}

  async create(createDanhMucDto: CreateDanhMucDto) {
    return await this.danhMucModel.create(createDanhMucDto);
  }

  async findAll() {
    return await this.danhMucModel.find().exec();
  }

  async findOne(id: string) {
    return await this.danhMucModel.findById(id);
  }

  async update(id: string, updateDanhMucDto: UpdateDanhMucDto) {
    return await this.danhMucModel.findByIdAndUpdate(id, updateDanhMucDto, { new: true });
  }

  async remove(id: string) {
    return await this.danhMucModel.findByIdAndDelete(id);
  }
}
