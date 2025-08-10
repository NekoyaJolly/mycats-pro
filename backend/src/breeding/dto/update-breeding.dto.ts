import { PartialType } from "@nestjs/mapped-types";
import { CreateBreedingDto } from "./create-breeding.dto";

export class UpdateBreedingDto extends PartialType(CreateBreedingDto) {}
