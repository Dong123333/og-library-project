import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTacGiaDto {
  @IsNotEmpty({ message: 'Tên tác giả không được để trống' })
  tenTacGia: string;

  @IsOptional()
  quocTich: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  namSinh: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  namMat: number;

  @IsOptional()
  tieuSu: string;

  @IsOptional()
  butDanh: string;
}
