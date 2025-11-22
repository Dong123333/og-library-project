import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SachService } from './sach.service';
import { CreateSachDto } from './dto/create-sach.dto';
import { UpdateSachDto } from './dto/update-sach.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('sach')
export class SachController {
  constructor(private readonly sachService: SachService) {}

  @Post()
  @UseInterceptors(FileInterceptor('hinhAnh'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createSachDto: CreateSachDto,
  ) {
    return this.sachService.create(createSachDto, file);
  }

  @Get()
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() query: string,
  ) {
    return this.sachService.findAll(+currentPage || 1, +limit || 10, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sachService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('hinhAnh'))
  update(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateSachDto: UpdateSachDto,
  ) {
    return this.sachService.update(id, updateSachDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sachService.remove(id);
  }
}
