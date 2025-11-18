import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NhaXuatBanService } from './nha-xuat-ban.service';
import { CreateNhaXuatBanDto } from './dto/create-nha-xuat-ban.dto';
import { UpdateNhaXuatBanDto } from './dto/update-nha-xuat-ban.dto';

@Controller('nha-xuat-ban')
export class NhaXuatBanController {
  constructor(private readonly nhaXuatBanService: NhaXuatBanService) {}

  @Post()
  create(@Body() createNhaXuatBanDto: CreateNhaXuatBanDto) {
    return this.nhaXuatBanService.create(createNhaXuatBanDto);
  }

  @Get()
  findAll() {
    return this.nhaXuatBanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nhaXuatBanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNhaXuatBanDto: UpdateNhaXuatBanDto) {
    return this.nhaXuatBanService.update(+id, updateNhaXuatBanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nhaXuatBanService.remove(+id);
  }
}
