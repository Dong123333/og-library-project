import { Injectable } from '@nestjs/common';
import { CreateTacGiaSachDto } from './dto/create-tac-gia_sach.dto';
import { UpdateTacGiaSachDto } from './dto/update-tac-gia_sach.dto';

@Injectable()
export class TacGiaSachService {
  create(createTacGiaSachDto: CreateTacGiaSachDto) {
    return 'This action adds a new tacGiaSach';
  }

  findAll() {
    return `This action returns all tacGiaSach`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tacGiaSach`;
  }

  update(id: number, updateTacGiaSachDto: UpdateTacGiaSachDto) {
    return `This action updates a #${id} tacGiaSach`;
  }

  remove(id: number) {
    return `This action removes a #${id} tacGiaSach`;
  }
}
