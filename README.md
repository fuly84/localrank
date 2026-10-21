# LocalRank

A free, open-source tool for tracking your business's visibility on Google Maps through **manual observations**. Built with Next.js App Router, TypeScript, Tailwind CSS and shadcn/ui. The interface is in French.

**LocalRank does not fetch, scrape, verify or invent Google rankings.** Without a Google API, automated and reliable ranking retrieval is not available. You open a search, observe the results yourself, and enter your position, rating and review count.

## Features

- Track multiple business / city / keyword combinations.
- Open the matching Google Maps search in a new tab.
- Add, edit and delete timestamped manual observations, including “not found”.
- See the latest position, rating, review count and change since the previous observation.
- View position history with 30-day, 90-day and all-time filters. Lower rank numbers appear higher on the chart. “Not found” observations break the line and never become invented numeric rankings.
- Compare any two observations in chronological order.
- Export the active history to CSV; back up and restore all data with validated JSON files.
- Explore an explicitly fictional demo that is never saved to localStorage.
- Use the app on desktop or mobile, with keyboard navigation, labelled forms, accessible dialogs and reduced-motion support.

## Quick start

Requirements: **Node.js 20.9+** and **pnpm 11.25.0**. A current Node.js LTS release is recommended.

```bash
git clone https://github.com/fuly84/localrank.git
cd localrank
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). No environment variables, database, account or API key are needed.

```bash
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
pnpm test          # Data validation, ranking, URL, CSV and demo tests
pnpm build         # Production static export in out/
pnpm start         # Serve the production export locally on port 3000
```

The committed lockfile pins the dependency versions. The build uses a self-hosted Geist font from the `geist` package, so it does not download fonts from Google.

## How to use

1. Enter your business name, city and keyword to create a tracker.
2. Open Google Maps using the generated link. The business name is intentionally excluded from the query so it does not bias a keyword search. The city is added only when it is not already included.
3. Find your business in the organic results, excluding sponsored listings. Enter the observed rank, rating and review count. Use **“Je n’ai pas trouvé mon commerce”** when appropriate; a missing position is stored as `null`.
4. Repeat under comparable conditions and compare your observations.

The `api=1` parameter in a Google Maps **URL** is Google's standard link format. It does not call an API, require credentials or fetch results in the application.

Search results can vary with your physical location, account, device, time and search context. LocalRank records a point-in-time observation, not an official or independently verified ranking. It does not calculate an estimated visibility score or promise ranking improvements. A positive position delta means improvement: moving from #12 to #7 is **+5 places**.

## Data and privacy

- All business data lives under `localrank:v1` in **localStorage**, scoped to the browser and site origin.
- The app has no analytics, cookies, authentication, remote data requests, paid services or server-side business logic. External navigation happens only when you follow Google Maps or GitHub links.
- There is no cross-device sync. Private browsing, browser storage restrictions or clearing site data may make data unavailable. Export JSON backups regularly.
- JSON imports are validated before writing and require an explicit replacement confirmation. CSV exports escape spreadsheet formula prefixes in user-entered text.
- Storage failures are surfaced to the user. Corrupted data is not silently overwritten. Other open tabs are notified of storage changes; simultaneous edits are last-write-wins, since localStorage has no transactions.
- Backups are plain JSON and are not encrypted. Keep them somewhere you trust.

The app supports up to 100 trackers and 10,000 observations per backup, with a 5 MB import limit. Browser localStorage quotas may be reached earlier.

## Deployment

The project sets `output: "export"` and produces a static `out/` directory. There are no API routes, server actions, serverless functions or runtime secrets.

### Vercel

1. Import this repository into Vercel.
2. Use the **Next.js** framework preset and the default project root.
3. Use `pnpm install --frozen-lockfile` for installation and `pnpm build` for the build command.
4. Deploy. Next.js's static export is detected automatically; no environment variables are required.

The same `out/` directory can be served by any static web host. The application needs no paid API or backend. Hosting providers' free-plan limits and terms still apply. Data belongs to each origin: moving to another domain requires exporting and importing a backup.

## Project structure

```text
app/                    App Router entry, metadata, styles and favicon
components/ui/          shadcn/ui components (Radix primitives)
components/             Forms, chart, comparison, backup dialog and branding
lib/data.ts             Types, validation, Maps URLs, dates, deltas and CSV
lib/store.ts            localStorage store with cross-tab updates
lib/demo.ts             Opt-in fictional sample data
tests/data.test.ts      Core behaviour and boundary tests
scripts/serve.mjs       Local preview of the built static files
```

No charting service is needed: a small SVG component renders the observations. Ranking arithmetic and validation are separate from the UI. shadcn/ui components are vendored locally and can be customised without a component service.

## Contributing

Open an issue or submit a pull request. Keep the project small, accessible and transparent about manual data. Run lint, type checks, tests and the production build before submitting changes. Never commit real business observations, backups, credentials or environment files.

## License

[MIT](LICENSE). LocalRank is an independent project and is not affiliated with or endorsed by Google. Google Maps is a trademark of Google LLC.
