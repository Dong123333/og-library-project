import { Injectable } from '@nestjs/common';
import { CreatePhieuPhatDto } from './dto/create-phieu-phat.dto';
import { UpdatePhieuPhatDto } from './dto/update-phieu-phat.dto';

@Injectable()
export class PhieuPhatService {
  create(createPhieuPhatDto: CreatePhieuPhatDto) {
    return 'This action adds a new phieuPhat';
  }

  findAll() {
    return `This action returns all phieuPhat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phieuPhat`;
  }

  update(id: number, updatePhieuPhatDto: UpdatePhieuPhatDto) {
    return `This action updates a #${id} phieuPhat`;
  }

  remove(id: number) {
    return `This action removes a #${id} phieuPhat`;
  }
}
