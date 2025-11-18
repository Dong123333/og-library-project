import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PhieuPhatService } from './phieu-phat.service';
import { CreatePhieuPhatDto } from './dto/create-phieu-phat.dto';
import { UpdatePhieuPhatDto } from './dto/update-phieu-phat.dto';

@Controller('phieu-phat')
export class PhieuPhatController {
  constructor(private readonly phieuPhatService: PhieuPhatService) {}

  @Post()
  create(@Body() createPhieuPhatDto: CreatePhieuPhatDto) {
    return this.phieuPhatService.create(createPhieuPhatDto);
  }

  @Get()
  findAll() {
    return this.phieuPhatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phieuPhatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhieuPhatDto: UpdatePhieuPhatDto) {
    return this.phieuPhatService.update(+id, updatePhieuPhatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phieuPhatService.remove(+id);
  }
}
