import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoanItemDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'ID sách không hợp lệ' })
  maSach: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Số lượng mượn phải ít nhất là 1' })
  soLuongMuon: number;
}

export class CreateMuonTraDto {
  @IsNotEmpty({ message: 'Danh sách mượn không được để trống' })
  @IsArray({ message: 'Dữ liệu phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => LoanItemDto)
  items: LoanItemDto[];

  @IsNotEmpty({ message: 'Ngày hẹn trả không được để trống' })
  @IsDateString({}, { message: 'Ngày hẹn trả phải đúng định dạng ngày (ISO)' })
  ngayHenTra: string;

  @IsOptional()
  ghiChu: string;
}

export class ReturnBookDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  soLuongTra: number;

  @IsOptional()
  @IsNumber()
  tienPhat?: number;

  @IsOptional()
  @IsString()
  lyDoPhat?: string;
}
