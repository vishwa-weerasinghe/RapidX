export const HOME_PACKAGE_LIMIT = 8;

const normalizeName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const packageName = (pkg) => normalizeName(pkg?.Package_Name || pkg?.title);

const preferredPackages = [
  (name) => (name.includes("eco park") || name.includes("hurulu")) && name.includes("half day"),
  (name) =>
    (name.includes("eco park") || name.includes("hurulu")) &&
    name.includes("morning") &&
    name.includes("evening") &&
    !name.includes("half day"),
  (name) => name.includes("minneriya") && name.includes("half day"),
  (name) => name.includes("kaudulla") && name.includes("half day"),
  (name) =>
    name.includes("sigiriya") &&
    name.includes("pidurangala") &&
    name.includes("evening") &&
    (name.includes("eco") || name.includes("hurulu")),
  (name) => name.includes("polonnaruwa") && name.includes("ruins") && name.includes("safari"),
  (name) => name.includes("traditional") && name.includes("village"),
  (name) => name.includes("wasgamuwa") && name.includes("safari"),
];

const fallbackPackages = [
  null,
  null,
  null,
  null,
  (name) => name.includes("sigiriya") && name.includes("pidurangala") && name.includes("evening"),
  (name) => name.includes("polonnaruwa") && name.includes("ruins"),
  (name) => name.includes("village") && !name.includes("sigiriya"),
  null,
];

export function orderHomePackages(packages) {
  const source = Array.isArray(packages) ? packages : [];
  const ordered = [];
  const used = new Set();

  preferredPackages.forEach((matches, index) => {
    const candidates = source.filter((pkg) => !used.has(pkg));
    const selected =
      candidates.find((pkg) => matches(packageName(pkg))) ||
      (fallbackPackages[index]
        ? candidates.find((pkg) => fallbackPackages[index](packageName(pkg)))
        : undefined);

    if (selected) {
      ordered.push(selected);
      used.add(selected);
    }
  });

  return ordered.concat(source.filter((pkg) => !used.has(pkg)));
}