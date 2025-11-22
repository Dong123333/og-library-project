import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNhaXuatBanDto {
  @IsNotEmpty({ message: 'Tên nhà xuất bản không được để trống' })
  tenNhaXuatBan: string;

  @IsOptional()
  diaChi: string;
}
