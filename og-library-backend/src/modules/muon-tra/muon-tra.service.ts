import { Injectable } from '@nestjs/common';
import { CreateMuonTraDto } from './dto/create-muon-tra.dto';
import { UpdateMuonTraDto } from './dto/update-muon-tra.dto';

@Injectable()
export class MuonTraService {
  create(createMuonTraDto: CreateMuonTraDto) {
    return 'This action adds a new muonTra';
  }

  findAll() {
    return `This action returns all muonTra`;
  }

  findOne(id: number) {
    return `This action returns a #${id} muonTra`;
  }

  update(id: number, updateMuonTraDto: UpdateMuonTraDto) {
    return `This action updates a #${id} muonTra`;
  }

  remove(id: number) {
    return `This action removes a #${id} muonTra`;
  }
}
