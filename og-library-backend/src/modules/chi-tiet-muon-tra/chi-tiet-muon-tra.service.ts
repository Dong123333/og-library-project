import { Injectable } from '@nestjs/common';
import { CreateChiTietMuonTraDto } from './dto/create-chi-tiet-muon-tra.dto';
import { UpdateChiTietMuonTraDto } from './dto/update-chi-tiet-muon-tra.dto';

@Injectable()
export class ChiTietMuonTraService {
  create(createChiTietMuonTraDto: CreateChiTietMuonTraDto) {
    return 'This action adds a new chiTietMuonTra';
  }

  findAll() {
    return `This action returns all chiTietMuonTra`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chiTietMuonTra`;
  }

  update(id: number, updateChiTietMuonTraDto: UpdateChiTietMuonTraDto) {
    return `This action updates a #${id} chiTietMuonTra`;
  }

  remove(id: number) {
    return `This action removes a #${id} chiTietMuonTra`;
  }
}
