import {
  Controller,
  Get,
  Patch,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ThongBaoService } from './thong-bao.service';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@Controller('thong-bao')
@UseGuards(JwtAuthGuard)
export class ThongBaoController {
  constructor(private readonly thongBaoService: ThongBaoService) {}

  @Get()
  findAll(@Request() req) {
    return this.thongBaoService.findAll(
      req.user._id,
      req.user.maVaiTro.maVaiTro,
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.thongBaoService.markAsRead(id);
  }

  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.thongBaoService.markAllRead(
      req.user._id,
      req.user.maVaiTro.maVaiTro,
    );
  }
}
