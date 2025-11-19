import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNguoiDungDto {
  @IsMongoId({ message: '_id không hợp lệ' })
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;

  @IsOptional()
  tenNguoiDung: string;

  @IsOptional()
  ngaySinh: Date;

  @IsOptional()
  diaChi: string;

  @IsOptional()
  soDienThoai: string;
}
