import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssignTagDto {
  @ApiProperty({
    description: "タグID",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  })
  @IsUUID()
  tagId: string; // Updated example
}
