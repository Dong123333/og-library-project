import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MuonTraService } from './muon-tra.service';
import { CreateMuonTraDto, ReturnBookDto } from './dto/create-muon-tra.dto';
import { UpdateMuonTraDto } from './dto/update-muon-tra.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@Controller('muon-tra')
export class MuonTraController {
  constructor(private readonly muonTraService: MuonTraService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  register(@Request() req, @Body() createMuonTraDto: CreateMuonTraDto) {
    return this.muonTraService.register(req.user._id, createMuonTraDto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('ghiChu') ghiChu: string) {
    return this.muonTraService.approve(id, ghiChu);
  }

  @Patch(':id/pickup')
  pickup(@Param('id') id: string) {
    return this.muonTraService.pickup(id);
  }

  @Patch('detail/:id/return')
  returnBook(@Param('id') id: string, @Body() returnBookDto: ReturnBookDto) {
    return this.muonTraService.returnDetail(id, returnBookDto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Request() req) {
    return this.muonTraService.cancel(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    const user = req.user;

    if (user.role === 'VT002') {
      return this.muonTraService.findAll();
    }

    // Nếu là Reader -> Chỉ xem của mình
    return this.muonTraService.getHistoryByUser(user._id);
  }

  @Get(':id/details') // Lấy chi tiết
  getDetails(@Param('id') id: string) {
    return this.muonTraService.findDetails(id);
  }
}
