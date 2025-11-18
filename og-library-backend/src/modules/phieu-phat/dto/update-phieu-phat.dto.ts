import { PartialType } from '@nestjs/mapped-types';
import { CreatePhieuPhatDto } from './create-phieu-phat.dto';

export class UpdatePhieuPhatDto extends PartialType(CreatePhieuPhatDto) {}
