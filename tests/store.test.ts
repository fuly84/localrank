import assert from "node:assert/strict";
import { test } from "node:test";
import { EMPTY_DATA, STORAGE_KEY } from "../lib/data";
import { saveData, updateData } from "../lib/store";

function mockStorage(initial: string | null = null, blocked = false) {
  let raw = initial;
  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: {
        getItem: (key: string) => (key === STORAGE_KEY ? raw : null),
        setItem: (_key: string, value: string) => {
          if (blocked) throw new Error("QuotaExceededError");
          raw = value;
        },
      },
    },
    configurable: true,
  });
  return () => raw;
}

test("saving validates and persists a JSON backup", () => {
  const read = mockStorage();
  saveData(EMPTY_DATA);
  assert.deepEqual(JSON.parse(read()!), EMPTY_DATA);
});

test("blocked storage raises a visible error without pretending to save", () => {
  const read = mockStorage(null, true);
  assert.throws(() => saveData(EMPTY_DATA), /Sauvegarde impossible/);
  assert.equal(read(), null);
});

test("updating does not silently replace corrupted data", () => {
  const read = mockStorage("corrupted");
  assert.throws(() => updateData(() => EMPTY_DATA), /Impossible de lire/);
  assert.equal(read(), "corrupted");
});

test("updating reads current storage before applying a change", () => {
  const profile = {
    id: "other-tab",
    name: "Test",
    city: "Paris",
    keyword: "coiffeur",
    createdAt: "2026-01-01T00:00:00Z",
  };
  const read = mockStorage(
    JSON.stringify({ ...EMPTY_DATA, profiles: [profile] }),
  );
  updateData((current) => ({ ...current, activeProfileId: profile.id }));
  const saved = JSON.parse(read()!);
  assert.equal(saved.profiles[0].id, "other-tab");
  assert.equal(saved.activeProfileId, "other-tab");
});
