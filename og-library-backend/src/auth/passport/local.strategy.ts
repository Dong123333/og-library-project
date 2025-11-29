import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { TrangThaiNguoiDung } from '../../modules/nguoi-dung/schemas/nguoi-dung.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'matKhau' });
  }

  async validate(email: string, matKhau: string): Promise<any> {
    const user = await this.authService.validateUser(email, matKhau);
    if (!user) {
      throw new HttpException(
        'Email hoặc mật khẩu không hợp lệ',
        HttpStatus.UNAUTHORIZED,
      ); //401
    }
    if (user.trangThai === TrangThaiNguoiDung.CHUA_KICH_HOAT) {
      throw new HttpException(
        'Tài khoản chưa được kích hoạt',
        HttpStatus.PRECONDITION_FAILED, // 412
      );
    }
    if (user.trangThai === TrangThaiNguoiDung.BI_KHOA) {
      throw new HttpException(
        'Tài khoản đã bị khóa',
        HttpStatus.FORBIDDEN, // 403
      );
    }
    return user;
  }
}
