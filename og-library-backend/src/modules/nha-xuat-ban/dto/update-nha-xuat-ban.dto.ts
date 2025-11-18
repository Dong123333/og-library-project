import { PartialType } from '@nestjs/mapped-types';
import { CreateNhaXuatBanDto } from './create-nha-xuat-ban.dto';

export class UpdateNhaXuatBanDto extends PartialType(CreateNhaXuatBanDto) {}
