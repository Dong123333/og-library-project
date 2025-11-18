import { PartialType } from '@nestjs/mapped-types';
import { CreateTacGiaSachDto } from './create-tac-gia_sach.dto';

export class UpdateTacGiaSachDto extends PartialType(CreateTacGiaSachDto) {}
