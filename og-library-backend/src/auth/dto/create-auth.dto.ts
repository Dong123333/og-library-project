import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  hoVaTen: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  matKhau: string;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  maOTP: string;
}

export class ChangePasswordAuthDto {
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  maOTP: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  matKhau: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  xacNhanMatKhau: string;
}
