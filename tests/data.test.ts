import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chronological,
  EMPTY_DATA,
  mapsUrl,
  parseData,
  rankChange,
  toCsv,
  type LocalData,
  type Observation,
} from "../lib/data";
import { createDemo } from "../lib/demo";

const profile = {
  id: "p1",
  name: "Test shop",
  city: "Paris",
  keyword: "coiffeur Paris",
  createdAt: "2026-01-01T10:00:00.000Z",
};
const observation: Observation = {
  id: "o1",
  profileId: "p1",
  observedAt: "2026-01-02T10:00:00.000Z",
  position: 12,
  rating: 4.5,
  reviews: 80,
  notes: "Manual test",
};
function fixture(): LocalData {
  return structuredClone({
    version: 1,
    profiles: [profile],
    observations: [observation],
    activeProfileId: "p1",
  });
}

test("Google Maps URL encodes the query without adding the business name", () => {
  const url = new URL(
    mapsUrl({ city: "Paris", keyword: "coiffeur & barbier" }),
  );
  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.searchParams.get("query"), "coiffeur & barbier Paris");
  assert.equal(url.searchParams.get("api"), "1");
});

test("city matching is case/accent insensitive and does not duplicate a city", () => {
  assert.equal(
    new URL(
      mapsUrl({ city: "Orléans", keyword: "Fleuriste ORLEANS" }),
    ).searchParams.get("query"),
    "Fleuriste ORLEANS",
  );
});

test("a city embedded in another word does not count as the location", () => {
  assert.equal(
    new URL(mapsUrl({ city: "Paris", keyword: "comparis" })).searchParams.get(
      "query",
    ),
    "comparis Paris",
  );
});

test("ranking deltas have the correct direction", () => {
  assert.equal(rankChange(observation, { ...observation, position: 7 }), 5);
  assert.equal(rankChange(observation, { ...observation, position: 15 }), -3);
  assert.equal(rankChange(observation, { ...observation, position: 12 }), 0);
});

test("unranked and missing observations never produce a fabricated delta", () => {
  assert.equal(
    rankChange(observation, { ...observation, position: null }),
    null,
  );
  assert.equal(rankChange(undefined, observation), null);
  assert.equal(
    rankChange({ ...observation, position: null }, observation),
    null,
  );
});

test("observations sort by observation time without mutating input", () => {
  const earlier = {
    ...observation,
    id: "earlier",
    observedAt: "2026-01-01T10:00:00Z",
  };
  const input = [observation, earlier];
  assert.deepEqual(
    chronological(input).map((o) => o.id),
    ["earlier", "o1"],
  );
  assert.equal(input[0].id, "o1");
});

test("equal timestamps preserve insertion order", () => {
  assert.deepEqual(
    chronological([
      { ...observation, id: "z" },
      { ...observation, id: "a" },
    ]).map((o) => o.id),
    ["z", "a"],
  );
});

test("valid backups round-trip and empty storage is valid", () => {
  const data = fixture();
  assert.deepEqual(parseData(JSON.parse(JSON.stringify(data))), data);
  assert.deepEqual(parseData(EMPTY_DATA), EMPTY_DATA);
});

test("an absent active profile falls back to the first valid profile", () => {
  assert.equal(
    parseData({ ...fixture(), activeProfileId: "deleted" }).activeProfileId,
    "p1",
  );
});

test("unsupported schemas and malformed inputs are rejected", () => {
  for (const input of [
    null,
    [],
    {},
    { ...fixture(), version: 2 },
    { ...fixture(), profiles: "bad" },
  ])
    assert.throws(() => parseData(input));
});

test("duplicate IDs and orphan observations are rejected", () => {
  const data = fixture();
  assert.throws(() => parseData({ ...data, profiles: [profile, profile] }));
  assert.throws(() =>
    parseData({ ...data, observations: [observation, observation] }),
  );
  assert.throws(() =>
    parseData({
      ...data,
      observations: [{ ...observation, profileId: "unknown" }],
    }),
  );
});

test("numeric limits and invalid dates are enforced at import", () => {
  for (const patch of [
    { position: 0 },
    { position: 1.5 },
    { position: 1001 },
    { rating: 5.1 },
    { rating: -1 },
    { rating: 4.55 },
    { rating: NaN },
    { reviews: -1 },
    { reviews: 2.5 },
    { observedAt: "not a date" },
    { notes: "a".repeat(501) },
  ]) {
    assert.throws(() =>
      parseData({ ...fixture(), observations: [{ ...observation, ...patch }] }),
    );
  }
  assert.equal(
    parseData({
      ...fixture(),
      observations: [{ ...observation, position: null }],
    }).observations[0].position,
    null,
  );
});

test("CSV escapes delimiters, quotes, formula injection and keeps source honest", () => {
  const csv = toCsv(
    { ...profile, name: "=SUM(1;2)", keyword: 'test "quoted"' },
    [observation, { ...observation, id: "o2", position: null }],
  );
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=SUM(1;2)"'));
  assert.ok(csv.includes('"test ""quoted"""'));
  assert.ok(csv.includes('"Non trouvé"'));
  assert.ok(csv.includes("Observation manuelle non vérifiée"));
});

test("demo content is explicitly fictional and independently valid", () => {
  const data = parseData(createDemo());
  assert.ok(data.profiles[0].name.includes("fictif"));
  assert.ok(data.observations.every((o) => o.notes.includes("fictif")));
  assert.equal(data.observations.length, 8);
});
