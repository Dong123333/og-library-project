import { PartialType } from '@nestjs/mapped-types';
import { CreateChiTietMuonTraDto } from './create-chi-tiet-muon-tra.dto';

export class UpdateChiTietMuonTraDto extends PartialType(CreateChiTietMuonTraDto) {}
