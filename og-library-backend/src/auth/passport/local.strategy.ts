
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'matKhau' });
  }

  async validate(email: string, matKhau: string): Promise<any> {
    const user = await this.authService.validateUser(email, matKhau);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
    }
    return user;
  }
}
