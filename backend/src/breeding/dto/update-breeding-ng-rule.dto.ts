import { PartialType } from "@nestjs/mapped-types";

import { CreateBreedingNgRuleDto } from "./create-breeding-ng-rule.dto";

export class UpdateBreedingNgRuleDto extends PartialType(CreateBreedingNgRuleDto) {}
