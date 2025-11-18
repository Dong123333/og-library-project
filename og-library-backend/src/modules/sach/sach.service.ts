import { Injectable } from '@nestjs/common';
import { CreateSachDto } from './dto/create-sach.dto';
import { UpdateSachDto } from './dto/update-sach.dto';

@Injectable()
export class SachService {
  create(createSachDto: CreateSachDto) {
    return 'This action adds a new sach';
  }

  findAll() {
    return `This action returns all sach`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sach`;
  }

  update(id: number, updateSachDto: UpdateSachDto) {
    return `This action updates a #${id} sach`;
  }

  remove(id: number) {
    return `This action removes a #${id} sach`;
  }
}
