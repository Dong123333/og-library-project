import { Controller, Post, UseGuards, Req, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '../decorator/customize';
import {
  ChangePasswordAuthDto,
  ChangePasswordProfileAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { JwtAuthGuard } from './passport/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Req() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Post('check-code')
  @Public()
  checkCode(@Body() codeAuthDto: CodeAuthDto) {
    return this.authService.handleActive(codeAuthDto);
  }

  @Post('resend-otp')
  @Public()
  resendOTP(@Body('email') email: string) {
    return this.authService.handleResendOTP(email);
  }

  @Post('retry-password')
  @Public()
  retryPassword(@Body('email') email: string) {
    return this.authService.handleRetryPassword(email);
  }

  @Post('change-password')
  @Public()
  changePassword(@Body() changePasswordAuthDto: ChangePasswordAuthDto) {
    return this.authService.handleChangePassword(changePasswordAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password-profile')
  changePasswordProfile(
    @Req() req,
    @Body() changePasswordProfileAuthDto: ChangePasswordProfileAuthDto,
  ) {
    return this.authService.handleChangePasswordProfile(
      req.user.email,
      changePasswordProfileAuthDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.authService.findOne(req.user._id);
  }
}
