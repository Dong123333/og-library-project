import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChiTietMuonTraService } from './chi-tiet-muon-tra.service';
import { CreateChiTietMuonTraDto } from './dto/create-chi-tiet-muon-tra.dto';
import { UpdateChiTietMuonTraDto } from './dto/update-chi-tiet-muon-tra.dto';

@Controller('chi-tiet-muon-tra')
export class ChiTietMuonTraController {
  constructor(private readonly chiTietMuonTraService: ChiTietMuonTraService) {}

  @Post()
  create(@Body() createChiTietMuonTraDto: CreateChiTietMuonTraDto) {
    return this.chiTietMuonTraService.create(createChiTietMuonTraDto);
  }

  @Get()
  findAll() {
    return this.chiTietMuonTraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chiTietMuonTraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChiTietMuonTraDto: UpdateChiTietMuonTraDto) {
    return this.chiTietMuonTraService.update(+id, updateChiTietMuonTraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chiTietMuonTraService.remove(+id);
  }
}
