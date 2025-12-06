import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import {
  UpdateProfileDto,
  UpdateUserByAdminDto,
} from './dto/update-nguoi-dung.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@Controller('nguoi-dung')
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

  @Post()
  create(@Body() createNguoiDungDto: CreateNguoiDungDto) {
    return this.nguoiDungService.create(createNguoiDungDto);
  }

  @Get()
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() query: string,
  ) {
    return this.nguoiDungService.findAll(
      +currentPage || 1,
      +limit || 10,
      query,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nguoiDungService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.nguoiDungService.updateProfile(req.user._id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUserByAdmin(
    @Param('id') id: string,
    @Body() updateUserByAdminDto: UpdateUserByAdminDto,
  ) {
    return this.nguoiDungService.updateUserByAdmin(id, updateUserByAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nguoiDungService.remove(id);
  }
}
