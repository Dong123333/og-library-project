import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { VaiTro } from '../../vai-tro/schemas/vai-tro.schema';

export class CreateNguoiDungDto {
  @IsNotEmpty({ message: 'Ten nguoi dung khong duoc de trong' })
  hoVaTen: string;

  @IsNotEmpty({ message: 'Email khong duoc de trong' })
  @IsEmail({}, { message: 'Email khong dung dinh dang' })
  email: string;

  @IsNotEmpty({ message: 'Mat khau khong duoc de trong' })
  matKhau: string;

  @IsOptional()
  ngaySinh: Date;

  @IsOptional()
  diaChi: string;

  @IsOptional()
  soDienThoai: string;

  @IsOptional()
  trangThai: number;

  @IsOptional()
  maVaiTro: VaiTro;
}
