import {
  CatGender,
  InvalidGenderError,
  parseGenderInput,
  parseOptionalGenderInput,
} from "./gender";

describe("gender master parsing", () => {
  it("parses master names case-insensitively", () => {
    expect(parseGenderInput("Male")).toBe(CatGender.MALE);
    expect(parseGenderInput("female")).toBe(CatGender.FEMALE);
    expect(parseGenderInput("Neuter")).toBe(CatGender.NEUTER);
    expect(parseGenderInput("SPAY")).toBe(CatGender.SPAY);
  });

  it("parses master keys", () => {
    expect(parseGenderInput("1")).toBe(CatGender.MALE);
    expect(parseGenderInput("2")).toBe(CatGender.FEMALE);
    expect(parseGenderInput("3")).toBe(CatGender.NEUTER);
    expect(parseGenderInput("4")).toBe(CatGender.SPAY);
  });

  it("ignores optional inputs when undefined or blank", () => {
    expect(parseOptionalGenderInput(undefined)).toBeUndefined();
    expect(parseOptionalGenderInput(null)).toBeUndefined();
    expect(parseOptionalGenderInput("   ")).toBeUndefined();
  });

  it("throws for unsupported values", () => {
    expect(() => parseGenderInput("0")).toThrow(InvalidGenderError);
    expect(() => parseGenderInput("unknown"))
      .toThrow(InvalidGenderError);
  });
});
