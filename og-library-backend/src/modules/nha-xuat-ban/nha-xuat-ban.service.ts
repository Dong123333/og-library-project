import { Injectable } from '@nestjs/common';
import { CreateNhaXuatBanDto } from './dto/create-nha-xuat-ban.dto';
import { UpdateNhaXuatBanDto } from './dto/update-nha-xuat-ban.dto';

@Injectable()
export class NhaXuatBanService {
  create(createNhaXuatBanDto: CreateNhaXuatBanDto) {
    return 'This action adds a new nhaXuatBan';
  }

  findAll() {
    return `This action returns all nhaXuatBan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nhaXuatBan`;
  }

  update(id: number, updateNhaXuatBanDto: UpdateNhaXuatBanDto) {
    return `This action updates a #${id} nhaXuatBan`;
  }

  remove(id: number) {
    return `This action removes a #${id} nhaXuatBan`;
  }
}
