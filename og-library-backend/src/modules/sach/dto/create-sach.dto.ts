import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSachDto {
  @IsNotEmpty()
  tenSach: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray({ message: 'maTacGia phải là một danh sách (mảng)' })
  @IsMongoId({ each: true, message: 'Tác giả không hợp lệ (ID sai định dạng)' })
  maTacGia: string[];

  @IsNotEmpty()
  @IsMongoId({ message: 'Danh mục không hợp lệ' })
  maDanhMuc: string;

  @IsNotEmpty()
  @IsMongoId()
  maNhaXuatBan: string;

  @IsOptional()
  namXuatBan: number;

  @IsOptional()
  soLuong: number;

  @IsOptional()
  hinhAnh: string;

  @IsOptional()
  giaTien: number;
}
