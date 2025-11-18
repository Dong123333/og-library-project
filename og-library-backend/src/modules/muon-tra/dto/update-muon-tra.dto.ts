import { PartialType } from '@nestjs/mapped-types';
import { CreateMuonTraDto } from './create-muon-tra.dto';

export class UpdateMuonTraDto extends PartialType(CreateMuonTraDto) {}
