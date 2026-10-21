export const STORAGE_KEY = "localrank:v1";

export interface Profile {
  id: string;
  name: string;
  city: string;
  keyword: string;
  createdAt: string;
}

export interface Observation {
  id: string;
  profileId: string;
  observedAt: string;
  position: number | null;
  rating: number;
  reviews: number;
  notes: string;
}

export interface LocalData {
  version: 1;
  profiles: Profile[];
  observations: Observation[];
  activeProfileId: string | null;
}

export const EMPTY_DATA: LocalData = {
  version: 1,
  profiles: [],
  observations: [],
  activeProfileId: null,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validText(
  value: unknown,
  max: number,
  allowEmpty = false,
): value is string {
  return (
    typeof value === "string" &&
    value.length <= max &&
    (allowEmpty || value.trim().length > 0)
  );
}

function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

/** Validate at every trust boundary: localStorage and imported backups. */
export function parseData(value: unknown): LocalData {
  if (
    !isObject(value) ||
    value.version !== 1 ||
    !Array.isArray(value.profiles) ||
    !Array.isArray(value.observations)
  ) {
    throw new Error(
      "Ce fichier n’est pas une sauvegarde LocalRank compatible (version 1).",
    );
  }
  if (value.profiles.length > 100 || value.observations.length > 10000) {
    throw new Error(
      "La sauvegarde dépasse la limite de 100 suivis ou 10 000 relevés.",
    );
  }
  const profileIds = new Set<string>();
  const profiles: Profile[] = value.profiles.map((p: unknown) => {
    if (
      !isObject(p) ||
      !validText(p.id, 100) ||
      !validText(p.name, 100) ||
      !validText(p.city, 100) ||
      !validText(p.keyword, 150) ||
      !validDate(p.createdAt) ||
      profileIds.has(p.id)
    ) {
      throw new Error(
        "Un suivi est incomplet ou contient un identifiant en double.",
      );
    }
    profileIds.add(p.id);
    return {
      id: p.id,
      name: p.name.trim(),
      city: p.city.trim(),
      keyword: p.keyword.trim(),
      createdAt: p.createdAt,
    };
  });
  const observationIds = new Set<string>();
  const observations: Observation[] = value.observations.map((o: unknown) => {
    if (
      !isObject(o) ||
      !validText(o.id, 100) ||
      typeof o.profileId !== "string" ||
      !profileIds.has(o.profileId) ||
      observationIds.has(o.id) ||
      !validDate(o.observedAt) ||
      (o.position !== null &&
        (typeof o.position !== "number" ||
          !Number.isInteger(o.position) ||
          o.position < 1 ||
          o.position > 1000)) ||
      typeof o.rating !== "number" ||
      !Number.isFinite(o.rating) ||
      o.rating < 0 ||
      o.rating > 5 ||
      Math.abs(o.rating * 10 - Math.round(o.rating * 10)) > 0.00001 ||
      typeof o.reviews !== "number" ||
      !Number.isInteger(o.reviews) ||
      o.reviews < 0 ||
      o.reviews > 10000000 ||
      !validText(o.notes, 500, true)
    ) {
      throw new Error(
        "Un relevé contient des données invalides (date, position, note ou avis).",
      );
    }
    observationIds.add(o.id);
    return {
      id: o.id,
      profileId: o.profileId,
      observedAt: o.observedAt,
      position: o.position,
      rating: o.rating,
      reviews: o.reviews,
      notes: o.notes,
    };
  });
  const activeProfileId =
    typeof value.activeProfileId === "string" &&
    profileIds.has(value.activeProfileId)
      ? value.activeProfileId
      : (profiles[0]?.id ?? null);
  return { version: 1, profiles, observations, activeProfileId };
}

export function mapsUrl(profile: Pick<Profile, "city" | "keyword">): string {
  // The business name is deliberately excluded: it would bias the keyword ranking.
  const keyword = profile.keyword.trim();
  const city = profile.city.trim();
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr")
      .replace(/\s+/g, " ");
  const escapedCity = normalize(city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cityPattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escapedCity}($|[^\\p{L}\\p{N}])`,
    "u",
  );
  const query = cityPattern.test(normalize(keyword))
    ? keyword
    : `${keyword} ${city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function chronological(observations: Observation[]): Observation[] {
  return [...observations].sort(
    (a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt),
  );
}

/** Positive means improvement; an unranked observation has no numeric delta. */
export function rankChange(
  before?: Observation,
  after?: Observation,
): number | null {
  if (before?.position == null || after?.position == null) return null;
  return before.position - after.position;
}

export function formatDate(value: string, withTime = false): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

export function localDateTime(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function downloadFile(
  content: string,
  filename: string,
  type: string,
): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toCsv(profile: Profile, observations: Observation[]): string {
  const cell = (value: string | number | null) => {
    let text = value == null ? "Non trouvé" : String(value);
    // Prevent spreadsheet formula injection in user-entered text.
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [
    [
      "Commerce",
      "Ville",
      "Mot-clé",
      "Date ISO",
      "Position manuelle",
      "Note",
      "Avis",
      "Notes",
      "Source",
    ],
    ...chronological(observations).map((o) => [
      profile.name,
      profile.city,
      profile.keyword,
      o.observedAt,
      o.position,
      o.rating,
      o.reviews,
      o.notes,
      "Observation manuelle non vérifiée",
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}
