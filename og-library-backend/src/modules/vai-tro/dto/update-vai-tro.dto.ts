import { PartialType } from '@nestjs/mapped-types';
import { CreateVaiTroDto } from './create-vai-tro.dto';

export class UpdateVaiTroDto extends PartialType(CreateVaiTroDto) {}
