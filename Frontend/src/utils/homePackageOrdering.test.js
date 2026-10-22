import { describe, expect, it } from "vitest";
import { HOME_PACKAGE_LIMIT, orderHomePackages } from "./homePackageOrdering";

describe("orderHomePackages", () => {
  it("puts the requested existing packages first and preserves all remaining packages", () => {
    const packages = [
      { Package_Name: "Wasgamuwa Safari (Morning or Evening)" },
      { Package_Name: "Polonnaruwa Ruins & Evening Safari" },
      { Package_Name: "Hurulu Eco Park Safari (Morning or Evening)" },
      { Package_Name: "Traditional Village Tour" },
      { Package_Name: "Kaudulla Half Day Safari (Morning or Evening)" },
      { Package_Name: "Extra Tour" },
      { Package_Name: "Sigiriya or Pidurangala & Evening Hurulu Eco Park Safari" },
      { Package_Name: "Hurulu Eco Park Half Day Safari" },
      { Package_Name: "Minneriya Half Day Safari (Morning or Evening)" },
      { Package_Name: "Another Extra Tour" },
    ];

    const result = orderHomePackages(packages);

    expect(result.slice(0, HOME_PACKAGE_LIMIT).map((pkg) => pkg.Package_Name)).toEqual([
      "Hurulu Eco Park Half Day Safari",
      "Hurulu Eco Park Safari (Morning or Evening)",
      "Minneriya Half Day Safari (Morning or Evening)",
      "Kaudulla Half Day Safari (Morning or Evening)",
      "Sigiriya or Pidurangala & Evening Hurulu Eco Park Safari",
      "Polonnaruwa Ruins & Evening Safari",
      "Traditional Village Tour",
      "Wasgamuwa Safari (Morning or Evening)",
    ]);
    expect(result.slice(HOME_PACKAGE_LIMIT).map((pkg) => pkg.Package_Name)).toEqual([
      "Extra Tour",
      "Another Extra Tour",
    ]);
    expect(new Set(result).size).toBe(packages.length);
  });

  it("recognizes the catalog's shorter village and evening safari names", () => {
    const packages = [
      { Package_Name: "Village Tour" },
      { Package_Name: "Sigiriya or Pidurangala & Evening Safari" },
      { Package_Name: "Unrelated Package" },
      { Package_Name: "Polonnaruwa Ruins & Evening Safari" },
    ];

    const result = orderHomePackages(packages);

    expect(result.slice(0, 3).map((pkg) => pkg.Package_Name)).toEqual([
      "Sigiriya or Pidurangala & Evening Safari",
      "Polonnaruwa Ruins & Evening Safari",
      "Village Tour",
    ]);
    expect(result.at(-1).Package_Name).toBe("Unrelated Package");
  });
});