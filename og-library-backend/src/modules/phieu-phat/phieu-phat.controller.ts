import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PhieuPhatService } from './phieu-phat.service';
import { CreatePhieuPhatDto } from './dto/create-phieu-phat.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@Controller('phieu-phat')
@UseGuards(JwtAuthGuard)
export class PhieuPhatController {
  constructor(private readonly phieuPhatService: PhieuPhatService) {}

  @Post()
  create(@Body() createDto: CreatePhieuPhatDto) {
    return this.phieuPhatService.create(createDto);
  }

  @Get()
  findAll(@Request() req) {
    const user = req.user;
    if (user.role === 'VT002') {
      return this.phieuPhatService.findAll();
    }
    return this.phieuPhatService.findByUser(user._id);
  }

  @Patch(':id/pay')
  confirmPayment(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'VT002') {
      throw new BadRequestException('Chỉ Admin mới được xác nhận thu tiền');
    }
    return this.phieuPhatService.confirmPayment(id);
  }
}
