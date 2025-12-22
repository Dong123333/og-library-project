import { Injectable } from '@nestjs/common';
import { NguoiDungService } from '../modules/nguoi-dung/nguoi-dung.service';
import { comparePasswordHelper } from '../helpers/utils';
import { JwtService } from '@nestjs/jwt';
import {
  ChangePasswordAuthDto,
  ChangePasswordProfileAuthDto,
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

    if (user && user.matKhau) {
      const isValidPassword = await comparePasswordHelper(
        matKhau,
        user.matKhau,
      );
      if (isValidPassword) {
        return user;
      }
    }

    return null;
  }

  async login(user: any) {
    const roleCode = user.maVaiTro?.maVaiTro;
    const payload = {
      email: user.email,
      sub: user._id,
      maVaiTro: roleCode,
      hoVaTen: user.hoVaTen,
    };
    return {
      user: {
        _id: user._id,
        email: user.email,
        hoVaTen: user.hoVaTen,
        maVaiTro: {
          maVaiTro: roleCode,
        },
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

  async handleChangePasswordProfile(
    email: string,
    changePasswordProfileAuthDto: ChangePasswordProfileAuthDto,
  ) {
    return await this.nguoiDungService.handleChangePasswordProfile(
      email,
      changePasswordProfileAuthDto,
    );
  }

  async findOne(id: string) {
    return await this.nguoiDungService.findOne(id);
  }

  async validateFacebookUser(fbProfile: any) {
    return await this.nguoiDungService.validateFacebookUser(fbProfile);
  }

  getPrivacyPolicyHtml(): string {
    return `
      <div style="font-family: sans-serif; max-width: 800px; margin: auto; padding: 50px; line-height: 1.6;">
        <h1>Chính sách bảo mật - Olive Gallery</h1>
        <p>Chào mừng bạn đến với hệ thống thư viện Olive Gallery. Quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi.</p>
        <h2>1. Dữ liệu thu thập</h2>
        <p>Chúng tôi chỉ thu thập Họ tên và Email từ hồ sơ Facebook công khai của bạn để khởi tạo tài khoản thành viên.</p>
        <h2>2. Cách sử dụng dữ liệu</h2>
        <p>Dữ liệu này được sử dụng để định danh, quản lý quá trình mượn trả sách và gửi thông báo hệ thống.</p>
        <h2>3. Bảo mật thông tin</h2>
        <p>Chúng tôi không chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>
        <h2>4. Yêu cầu xóa dữ liệu</h2>
        <p>Bạn có thể yêu cầu xóa dữ liệu bất kỳ lúc nào thông qua công cụ quản lý ứng dụng của Facebook hoặc liên hệ trực tiếp với quản trị viên của chúng tôi.</p>
      </div>
    `;
  }

  getTermsHtml(): string {
    return `
      <div style="font-family: sans-serif; max-width: 800px; margin: auto; padding: 50px;">
        <h1>Điều khoản dịch vụ</h1>
        <p>Khi sử dụng tính năng đăng nhập Facebook tại Olive Gallery, bạn đồng ý với các quy định sau:</p>
        <ul>
          <li>Tuân thủ nội quy mượn trả sách của thư viện.</li>
          <li>Chịu trách nhiệm bảo quản sách và tài sản chung.</li>
          <li>Cập nhật đầy đủ thông tin cá nhân (Số điện thoại, địa chỉ) sau khi đăng nhập lần đầu.</li>
        </ul>
      </div>
    `;
  }

  getDataDeletionPage(): string {
    return `
    <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Xóa dữ liệu người dùng</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f5f6f7;
            padding: 40px;
          }
          .container {
              max-width: 600px;
              margin: auto;
              background: #fff;
              padding: 24px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
          h1 {
            font-size: 20px;
            margin-bottom: 16px;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Xóa dữ liệu người dùng</h1>
        <p>
        Nếu bạn đã đăng nhập bằng Facebook và muốn yêu cầu xóa dữ liệu
        liên quan đến tài khoản của bạn trong hệ thống
        <b>Olive Gallery</b>,
        vui lòng gửi yêu cầu tới email:
          </p>
          <p><b>hobadong777@gmail.com</b></p>
        <p>
          Chúng tôi sẽ xử lý yêu cầu trong vòng
        <b>7 ngày làm việc</b>.
        </p>
        </div>
      </body>
    </html>
    `;
  }

  handleFacebookDataDeletion(body: any) {
    const confirmation_code =
      'DEL-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    return {
      url: 'https://olive-gallery.onrender.com/api/v1/auth/privacy-policy',
      confirmation_code: confirmation_code,
    };
  }

  async validateGoogleUser(fbProfile: any) {
    return await this.nguoiDungService.validateGoogleUser(fbProfile);
  }

  getRedirectUrl(status: string, data: any) {
    return this.nguoiDungService.getRedirectUrl(status, data);
  }
}
