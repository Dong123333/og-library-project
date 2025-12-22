import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Body,
  Res,
} from '@nestjs/common';
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
import { AuthGuard } from '@nestjs/passport';
import * as express from 'express';

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

  @Get('facebook')
  @Public()
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {}

  @Get('facebook/callback')
  @Public()
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req, @Res() res: express.Response) {
    const result = await this.authService.validateFacebookUser(req.user);
    const redirectUrl = this.authService.getRedirectUrl(result.status, result);
    return res.redirect(redirectUrl);
  }

  @Get('privacy-policy')
  @Public()
  getPrivacyPolicy(@Res() res: express.Response) {
    const html = this.authService.getPrivacyPolicyHtml();
    res.header('Content-Type', 'text/html');
    return res.send(html);
  }

  @Get('terms')
  @Public()
  getTerms(@Res() res: express.Response) {
    const html = this.authService.getTermsHtml();
    res.header('Content-Type', 'text/html');
    return res.send(html);
  }

  @Get('data-deletion')
  @Public()
  getDataDeletionPage(@Res() res: express.Response) {
    const html = this.authService.getDataDeletionPage();
    res.header('Content-Type', 'text/html');
    return res.send(html);
  }

  @Post('facebook/data-deletion')
  @Public()
  handleDataDeletion(@Body() body: any) {
    return this.authService.handleFacebookDataDeletion(body);
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(@Req() req: any, @Res() res: express.Response) {
    const result = await this.authService.validateGoogleUser(req.user);
    const redirectUrl = this.authService.getRedirectUrl(result.status, result);
    return res.redirect(redirectUrl);
  }
}
