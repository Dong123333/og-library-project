import { Injectable } from '@nestjs/common';
import { CreateVaiTroDto } from './dto/create-vai-tro.dto';
import { UpdateVaiTroDto } from './dto/update-vai-tro.dto';

@Injectable()
export class VaiTroService {
  create(createVaiTroDto: CreateVaiTroDto) {
    return 'This action adds a new vaiTro';
  }

  findAll() {
    return `This action returns all vaiTro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vaiTro`;
  }

  update(id: number, updateVaiTroDto: UpdateVaiTroDto) {
    return `This action updates a #${id} vaiTro`;
  }

  remove(id: number) {
    return `This action removes a #${id} vaiTro`;
  }
}
