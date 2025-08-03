import { PartialType } from '@nestjs/mapped-types';
import { CreateCoatColorDto } from './create-coat-color.dto';

export class UpdateCoatColorDto extends PartialType(CreateCoatColorDto) {}
