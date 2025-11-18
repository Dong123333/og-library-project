import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TacGiaSachService } from './tac-gia_sach.service';
import { CreateTacGiaSachDto } from './dto/create-tac-gia_sach.dto';
import { UpdateTacGiaSachDto } from './dto/update-tac-gia_sach.dto';

@Controller('tac-gia-sach')
export class TacGiaSachController {
  constructor(private readonly tacGiaSachService: TacGiaSachService) {}

  @Post()
  create(@Body() createTacGiaSachDto: CreateTacGiaSachDto) {
    return this.tacGiaSachService.create(createTacGiaSachDto);
  }

  @Get()
  findAll() {
    return this.tacGiaSachService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tacGiaSachService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTacGiaSachDto: UpdateTacGiaSachDto) {
    return this.tacGiaSachService.update(+id, updateTacGiaSachDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tacGiaSachService.remove(+id);
  }
}
