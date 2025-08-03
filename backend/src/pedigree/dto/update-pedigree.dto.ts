import { PartialType } from '@nestjs/mapped-types';
import { CreatePedigreeDto } from './create-pedigree.dto';

export class UpdatePedigreeDto extends PartialType(CreatePedigreeDto) {}
