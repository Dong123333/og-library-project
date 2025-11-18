import { PartialType } from '@nestjs/mapped-types';
import { CreateSachDto } from './create-sach.dto';

export class UpdateSachDto extends PartialType(CreateSachDto) {}
