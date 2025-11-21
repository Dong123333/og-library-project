import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NguoiDungService } from '../modules/nguoi-dung/nguoi-dung.service';
import { comparePasswordHelper } from '../helpers/utils';
import { JwtService } from '@nestjs/jwt';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
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

  async login(user: any) {
    const roleName = user.maVaiTro?.tenVaiTro || 'reader';
    const payload = { username: user.email, sub: user._id, role: roleName, fullName: user.hoVaTen };
    return {
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.hoVaTen,
        role: roleName,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return await this.nguoiDungService.handleRegister(registerDto);
  }

  async handleActive(codeAuthDto: CodeAuthDto) {
    return await this.nguoiDungService.handleActive(codeAuthDto);
  }

  async handleResendOTP(email: string) {
    return await this.nguoiDungService.handleResendOTP(email);
  }

  async handleRetryPassword(email: string) {
    return await this.nguoiDungService.handleRetryPassword(email);
  }

  async handleChangePassword(changePasswordAuthDto: ChangePasswordAuthDto) {
    return await this.nguoiDungService.handleChangePassword(
      changePasswordAuthDto,
    );
  }
}
