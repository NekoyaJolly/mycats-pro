import { PartialType } from "@nestjs/mapped-types";
import { IsIn, IsOptional } from "class-validator";

import { CreateCatDto } from "./create-cat.dto";

export class UpdateCatDto extends PartialType(CreateCatDto) {
  @IsOptional()
  @IsIn(["MALE", "FEMALE"])
  gender?: "MALE" | "FEMALE";
}
