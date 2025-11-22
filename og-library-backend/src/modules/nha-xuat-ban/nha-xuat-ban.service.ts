import { Injectable } from '@nestjs/common';
import { CreateNhaXuatBanDto } from './dto/create-nha-xuat-ban.dto';
import { UpdateNhaXuatBanDto } from './dto/update-nha-xuat-ban.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NhaXuatBan } from './schemas/nha-xuat-ban.schema';
import { Model } from 'mongoose';

@Injectable()
export class NhaXuatBanService {
  constructor(
    @InjectModel(NhaXuatBan.name) private nhaXuatBanModel: Model<NhaXuatBan>,
  ) {}

  async create(createNhaXuatBanDto: CreateNhaXuatBanDto) {
    return await this.nhaXuatBanModel.create(createNhaXuatBanDto);
  }

  async findAll() {
    return await this.nhaXuatBanModel.find().exec();
  }

  async findOne(id: string) {
    return await this.nhaXuatBanModel.findById(id);
  }

  async update(id: string, updateNhaXuatBanDto: UpdateNhaXuatBanDto) {
    return await this.nhaXuatBanModel.findByIdAndUpdate(id, updateNhaXuatBanDto, { new: true });
  }

  async remove(id: string) {
    return await this.nhaXuatBanModel.findByIdAndDelete(id);
  }
}
