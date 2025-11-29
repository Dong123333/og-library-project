import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePhieuPhatDto {
  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  @IsMongoId({ message: 'Mã người dùng (ObjectId) không hợp lệ' })
  maNguoiDung: string;

  @IsNotEmpty({ message: 'Mã phiếu mượn không được để trống' })
  @IsMongoId({ message: 'Mã phiếu mượn (ObjectId) không hợp lệ' })
  maMuonTra: string;

  @IsNotEmpty({ message: 'Mã sách không được để trống' })
  @IsMongoId({ message: 'Mã sách (ObjectId) không hợp lệ' })
  maSach: string;

  @IsNotEmpty({ message: 'Số tiền phạt không được để trống' })
  soTien: number;

  @IsOptional()
  ngayLap: Date;

  @IsNotEmpty({ message: 'Lý do phạt không được để trống' })
  lyDo: string;

  @IsOptional()
  trangThai: boolean;
}
