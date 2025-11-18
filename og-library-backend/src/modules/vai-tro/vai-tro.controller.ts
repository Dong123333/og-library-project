import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VaiTroService } from './vai-tro.service';
import { CreateVaiTroDto } from './dto/create-vai-tro.dto';
import { UpdateVaiTroDto } from './dto/update-vai-tro.dto';

@Controller('vai-tro')
export class VaiTroController {
  constructor(private readonly vaiTroService: VaiTroService) {}

  @Post()
  create(@Body() createVaiTroDto: CreateVaiTroDto) {
    return this.vaiTroService.create(createVaiTroDto);
  }

  @Get()
  findAll() {
    return this.vaiTroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vaiTroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVaiTroDto: UpdateVaiTroDto) {
    return this.vaiTroService.update(+id, updateVaiTroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vaiTroService.remove(+id);
  }
}
