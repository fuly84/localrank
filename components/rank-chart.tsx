"use client";

import { useState } from "react";
import { ChartNoAxesCombined, CircleHelp } from "lucide-react";
import { chronological, formatDate, type Observation } from "@/lib/data";

export function RankChart({ observations }: { observations: Observation[] }) {
  const [period, setPeriod] = useState("all");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period));
  const points = chronological(observations).filter(
    (o) => period === "all" || new Date(o.observedAt) >= cutoff,
  );
  const ranked = points.filter((o) => o.position !== null);
  const maxRank = Math.max(10, ...ranked.map((o) => o.position! + 2));
  const ticks = [
    ...new Set([
      1,
      Math.round(maxRank / 3),
      Math.round((maxRank * 2) / 3),
      maxRank,
    ]),
  ];
  const start = points[0] ? Date.parse(points[0].observedAt) : 0;
  const span =
    points.length > 1 ? Date.parse(points.at(-1)!.observedAt) - start : 0;
  const x = (o: Observation) =>
    span ? 45 + ((Date.parse(o.observedAt) - start) / span) * 605 : 347;
  const y = (rank: number) => 27 + ((rank - 1) / (maxRank - 1)) * 154;
  const segments: Observation[][] = [];
  points.forEach((o) => {
    if (o.position === null) {
      if (segments.at(-1)?.length) segments.push([]);
    } else {
      if (!segments.length) segments.push([]);
      segments.at(-1)!.push(o);
    }
  });
  const focused = points.find((o) => o.id === focusedId) ?? ranked.at(-1);
  const labelPoints =
    points.length <= 5
      ? points
      : [
          points[0],
          points[Math.floor((points.length - 1) / 3)],
          points[Math.floor(((points.length - 1) * 2) / 3)],
          points.at(-1)!,
        ];
  return (
    <section className="panel chart-panel" aria-labelledby="chart-title">
      <div className="panel-heading">
        <div>
          <h3 id="chart-title">L’évolution de votre position</h3>
          <p>Plus la courbe monte, mieux vous êtes placé.</p>
        </div>
        <select
          className="small-select"
          aria-label="Période du graphique"
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setFocusedId(null);
          }}
        >
          <option value="all">Tout l’historique</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
      </div>
      <div className="chart-canvas">
        <svg
          viewBox="0 0 700 225"
          className="rank-svg"
          role="group"
          aria-label={
            ranked.length
              ? `Évolution de ${ranked.length} positions saisies manuellement. Les positions non trouvées interrompent la courbe.`
              : "Aucune position numérique sur cette période."
          }
        >
          <defs>
            <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4562e8" stopOpacity=".13" />
              <stop offset="100%" stopColor="#4562e8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1="45"
                y1={y(tick)}
                x2="665"
                y2={y(tick)}
                stroke="#ececf0"
                strokeDasharray="3 5"
              />
              <text
                x="26"
                y={y(tick) + 4}
                textAnchor="end"
                fill="#737b8d"
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          ))}
          {segments
            .filter((s) => s.length > 0)
            .map((segment, index) => {
              const d = segment
                .map((o, i) => `${i ? "L" : "M"}${x(o)},${y(o.position!)}`)
                .join(" ");
              return (
                <g key={index}>
                  <path
                    d={`${d} L${x(segment.at(-1)!)},190 L${x(segment[0])},190 Z`}
                    fill="url(#chartArea)"
                  />
                  <path
                    d={d}
                    stroke="#4562e8"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          {focused && (
            <line
              x1={x(focused)}
              y1="15"
              x2={x(focused)}
              y2="190"
              stroke="#4562e8"
              strokeOpacity=".2"
              strokeDasharray="4 4"
            />
          )}
          {ranked.map((o) => (
            <g key={o.id}>
              <circle
                cx={x(o)}
                cy={y(o.position!)}
                r="13"
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${formatDate(o.observedAt, true)} : position ${o.position}`}
                onMouseEnter={() => setFocusedId(o.id)}
                onMouseLeave={() => setFocusedId(null)}
                onFocus={() => setFocusedId(o.id)}
                onBlur={() => setFocusedId(null)}
                onClick={() => setFocusedId(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFocusedId(o.id);
                  }
                }}
              />
              <circle
                cx={x(o)}
                cy={y(o.position!)}
                r={focused?.id === o.id ? 5 : 3.5}
                fill="#4562e8"
                stroke="white"
                strokeWidth="2"
                pointerEvents="none"
              />
            </g>
          ))}
          {labelPoints.map((o) => (
            <text
              key={o.id}
              x={x(o)}
              y="216"
              textAnchor="middle"
              fill="#737b8d"
              fontSize="10"
            >
              {formatDate(o.observedAt)}
            </text>
          ))}
        </svg>
        {!ranked.length && (
          <div className="chart-empty">
            <span>
              <ChartNoAxesCombined size={23} strokeWidth={1.4} />
            </span>
            <strong>
              {observations.length
                ? "Pas de position sur cette période"
                : "Aucun relevé pour le moment"}
            </strong>
            <p>
              {points.length
                ? "Les relevés « non trouvé » restent dans l’historique."
                : observations.length
                  ? "Choisissez une autre période ou ajoutez un relevé."
                  : "Ajoutez votre premier relevé pour commencer."}
            </p>
          </div>
        )}
        {focused && (
          <div className="chart-point-summary" aria-live="polite">
            <span>{formatDate(focused.observedAt)}</span>
            <strong>#{focused.position}</strong>
          </div>
        )}
      </div>
      <div className="chart-footer">
        <span>
          <i />
          Position observée manuellement
        </span>
        <span className="flex items-center gap-1.5">
          <CircleHelp size={12} />1 = première position
        </span>
      </div>
    </section>
  );
}
