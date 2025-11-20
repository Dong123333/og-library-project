import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NguoiDungService } from '../modules/nguoi-dung/nguoi-dung.service';
import { comparePasswordHelper } from '../helpers/utils';
import { JwtService } from '@nestjs/jwt';
import {
  CodeAuthDto,
  CreateAuthDto,
  ResendOTPAuthDto,
} from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private nguoiDungService: NguoiDungService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, matKhau: string) {
    const user = await this.nguoiDungService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await comparePasswordHelper(matKhau, user.matKhau);

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async login (user:any) {
    const payload = { username: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return await this.nguoiDungService.handleRegister(registerDto);
  }

  async handleActive(codeAuthDto: CodeAuthDto) {
    return await this.nguoiDungService.handleActive(codeAuthDto);
  }

  async handleResendOTP(resendOTPAuthDto: ResendOTPAuthDto) {
    return await this.nguoiDungService.handleResendOTP(resendOTPAuthDto);
  }
}
