import { PartialType } from '@nestjs/mapped-types';
import { CreateDanhMucDto } from './create-danh-muc.dto';

export class UpdateDanhMucDto extends PartialType(CreateDanhMucDto) {}
