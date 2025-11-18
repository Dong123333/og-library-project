import { PartialType } from '@nestjs/mapped-types';
import { CreateTacGiaDto } from './create-tac-gia.dto';

export class UpdateTacGiaDto extends PartialType(CreateTacGiaDto) {}
