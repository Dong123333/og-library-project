import { Injectable } from '@nestjs/common';
import { CreateTacGiaDto } from './dto/create-tac-gia.dto';
import { UpdateTacGiaDto } from './dto/update-tac-gia.dto';

@Injectable()
export class TacGiaService {
  create(createTacGiaDto: CreateTacGiaDto) {
    return 'This action adds a new tacGia';
  }

  findAll() {
    return `This action returns all tacGia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tacGia`;
  }

  update(id: number, updateTacGiaDto: UpdateTacGiaDto) {
    return `This action updates a #${id} tacGia`;
  }

  remove(id: number) {
    return `This action removes a #${id} tacGia`;
  }
}
