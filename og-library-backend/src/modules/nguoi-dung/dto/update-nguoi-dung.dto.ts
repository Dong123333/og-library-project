import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateNguoiDungDto } from './create-nguoi-dung.dto';

export class UpdateProfileDto {
  @IsOptional()
  hoVaTen?: string;

  @IsOptional()
  hinhAnh?: string;

  @IsOptional()
  ngaySinh?: Date;

  @IsOptional()
  diaChi?: string;

  @IsOptional()
  soDienThoai?: string;
}

export class UpdateUserByAdminDto extends PartialType(CreateNguoiDungDto) {}
