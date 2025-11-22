import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDanhMucDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  tenDanhMuc: string;

  @IsOptional()
  moTa: string;
}
