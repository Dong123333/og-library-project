import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MuonTraService } from './muon-tra.service';
import { CreateMuonTraDto, ReturnBookDto } from './dto/create-muon-tra.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { Public } from '../../decorator/customize';

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
  findAll(
    @Request() req,
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() query: string,
  ) {
    const user = req.user;

    if (user.maVaiTro.maVaiTro === 'VT002') {
      return this.muonTraService.findAll(
        +currentPage || 1,
        +limit || 10,
        query,
      );
    }

    return this.muonTraService.getHistoryByUser(
      +currentPage || 1,
      +limit || 10,
      user._id);
  }

  @Get(':id/details')
  getDetails(@Param('id') id: string) {
    return this.muonTraService.findDetails(id);
  }

  @Get('trending')
  @Public()
  getTrending() {
    return this.muonTraService.getTrendingBooks(6);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  getRecommended(@Request() req) {
    const userId = req.user?._id;
    if (!userId) {
      return this.muonTraService.getTrendingBooks();
    }
    return this.muonTraService.getSmartRecommendedBooks(userId);
  }

  @Get('top-readers')
  @Public()
  async getTopReaders(@Query('limit') limit: number) {
    return this.muonTraService.getTopReadersThisMonth(limit || 5);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.muonTraService.getStatistics();
  }
}
