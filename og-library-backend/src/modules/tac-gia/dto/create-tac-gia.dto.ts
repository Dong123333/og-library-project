import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTacGiaDto {
  @IsNotEmpty({ message: 'Tên tác giả không được để trống' })
  tenTacGia: string;

  @IsOptional()
  quocTich: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (!value) return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  })
  namSinh: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (!value) return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  })
  namMat: number;

  @IsOptional()
  tieuSu: string;

  @IsOptional()
  butDanh: string;
}
