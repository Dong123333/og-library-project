import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DanhMucService } from './danh-muc.service';
import { CreateDanhMucDto } from './dto/create-danh-muc.dto';
import { UpdateDanhMucDto } from './dto/update-danh-muc.dto';

@Controller('danhmuc')
export class DanhMucController {
  constructor(private readonly danhMucService: DanhMucService) {}

  @Post()
  create(@Body() createDanhMucDto: CreateDanhMucDto) {
    return this.danhMucService.create(createDanhMucDto);
  }

  @Get()
  findAll() {
    return this.danhMucService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.danhMucService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDanhMucDto: UpdateDanhMucDto) {
    return this.danhMucService.update(+id, updateDanhMucDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.danhMucService.remove(+id);
  }
}
