export enum CatGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NEUTER = "NEUTER",
  SPAY = "SPAY",
}

export type GenderMasterKey = "1" | "2" | "3" | "4";
export type CatGenderInput = CatGender | GenderMasterKey;

export interface GenderMasterRecord {
  key: GenderMasterKey;
  name: string;
  canonical: CatGender;
}

export const GENDER_MASTER: ReadonlyArray<GenderMasterRecord> = [
  { key: "1", name: "Male", canonical: CatGender.MALE },
  { key: "2", name: "Female", canonical: CatGender.FEMALE },
  { key: "3", name: "Neuter", canonical: CatGender.NEUTER },
  { key: "4", name: "Spay", canonical: CatGender.SPAY },
];

const NAME_TO_CANONICAL = new Map<string, CatGender>();
const KEY_TO_CANONICAL = new Map<string, CatGender>();

for (const record of GENDER_MASTER) {
  NAME_TO_CANONICAL.set(record.name.toUpperCase(), record.canonical);
  NAME_TO_CANONICAL.set(record.canonical, record.canonical);
  KEY_TO_CANONICAL.set(record.key, record.canonical);
}

export const GENDER_INPUT_VALUES: ReadonlyArray<string> = [
  ...Object.values(CatGender),
  ...GENDER_MASTER.map((record) => record.key),
];

const DIGIT_PATTERN = /^\d+$/u;

export const transformGenderInput = (
  value: unknown,
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return trimmed;
    }

    if (DIGIT_PATTERN.test(trimmed)) {
      return trimmed;
    }

    return trimmed.toUpperCase();
  }

  return "";
};

export class InvalidGenderError extends Error {
  constructor(input: string) {
    super(`Invalid gender value: ${input}`);
    this.name = "InvalidGenderError";
  }
}

const coerceInputString = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
};

const resolveCanonicalGender = (value: string): CatGender | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.length === 1 ? value : value.toUpperCase();
  const fromName = NAME_TO_CANONICAL.get(normalized);
  if (fromName) {
    return fromName;
  }

  const fromKey = KEY_TO_CANONICAL.get(value);
  if (fromKey) {
    return fromKey;
  }

  return undefined;
};

export const parseGenderInput = (value: unknown): CatGender => {
  const input = coerceInputString(value);
  const canonical = resolveCanonicalGender(input);
  if (!canonical) {
    throw new InvalidGenderError(input || String(value));
  }

  return canonical;
};

export const parseOptionalGenderInput = (
  value: unknown,
): CatGender | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const input = coerceInputString(value);
  if (!input) {
    return undefined;
  }

  const canonical = resolveCanonicalGender(input);
  if (!canonical) {
    throw new InvalidGenderError(input);
  }

  return canonical;
};

export const GENDER_CANONICAL_ORDER: ReadonlyArray<CatGender> = [
  CatGender.MALE,
  CatGender.FEMALE,
  CatGender.NEUTER,
  CatGender.SPAY,
];
