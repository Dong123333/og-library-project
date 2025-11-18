import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SachService } from './sach.service';
import { CreateSachDto } from './dto/create-sach.dto';
import { UpdateSachDto } from './dto/update-sach.dto';

@Controller('sach')
export class SachController {
  constructor(private readonly sachService: SachService) {}

  @Post()
  create(@Body() createSachDto: CreateSachDto) {
    return this.sachService.create(createSachDto);
  }

  @Get()
  findAll() {
    return this.sachService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sachService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSachDto: UpdateSachDto) {
    return this.sachService.update(+id, updateSachDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sachService.remove(+id);
  }
}
