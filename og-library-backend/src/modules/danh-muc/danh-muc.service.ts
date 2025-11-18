import { Injectable } from '@nestjs/common';
import { CreateDanhMucDto } from './dto/create-danh-muc.dto';
import { UpdateDanhMucDto } from './dto/update-danh-muc.dto';

@Injectable()
export class DanhMucService {
  create(createDanhMucDto: CreateDanhMucDto) {
    return 'This action adds a new danhMuc';
  }

  findAll() {
    return `This action returns all danhMuc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} danhMuc`;
  }

  update(id: number, updateDanhMucDto: UpdateDanhMucDto) {
    return `This action updates a #${id} danhMuc`;
  }

  remove(id: number) {
    return `This action removes a #${id} danhMuc`;
  }
}
