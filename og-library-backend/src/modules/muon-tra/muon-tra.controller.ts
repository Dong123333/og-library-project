import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MuonTraService } from './muon-tra.service';
import { CreateMuonTraDto } from './dto/create-muon-tra.dto';
import { UpdateMuonTraDto } from './dto/update-muon-tra.dto';

@Controller('muon-tra')
export class MuonTraController {
  constructor(private readonly muonTraService: MuonTraService) {}

  @Post()
  create(@Body() createMuonTraDto: CreateMuonTraDto) {
    return this.muonTraService.create(createMuonTraDto);
  }

  @Get()
  findAll() {
    return this.muonTraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.muonTraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMuonTraDto: UpdateMuonTraDto) {
    return this.muonTraService.update(+id, updateMuonTraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.muonTraService.remove(+id);
  }
}
