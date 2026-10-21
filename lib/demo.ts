import type { LocalData } from "./data";

/** Explicitly fictional, opt-in, never written to localStorage. */
export function createDemo(): LocalData {
  const dates = [28, 24, 20, 16, 12, 8, 4, 0];
  const positions = [14, 12, 13, 9, 8, 6, 5, 3];
  const now = new Date();
  return {
    version: 1,
    activeProfileId: "demo",
    profiles: [
      {
        id: "demo",
        name: "Atelier Juniper · fictif",
        city: "Lyon",
        keyword: "fleuriste Lyon",
        createdAt: now.toISOString(),
      },
    ],
    observations: dates.map((days, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      date.setHours(10, 0, 0, 0);
      return {
        id: `demo-${index}`,
        profileId: "demo",
        observedAt: date.toISOString(),
        position: positions[index],
        rating: index < 4 ? 4.7 : 4.8,
        reviews: 82 + index * 3,
        notes: "Exemple fictif pour découvrir LocalRank.",
      };
    }),
  };
}
