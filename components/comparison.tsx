"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, GitCompareArrows } from "lucide-react";
import {
  chronological,
  formatDate,
  rankChange,
  type Observation,
} from "@/lib/data";

export function Comparison({ observations }: { observations: Observation[] }) {
  const list = chronological(observations);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const from = list.find((o) => o.id === fromId) ?? list[0];
  const to = list.find((o) => o.id === toId) ?? list.at(-1);
  const change = rankChange(from, to);
  const valid = list.length >= 2 && from && to && from.id !== to.id;
  const ascending =
    valid && Date.parse(from.observedAt) <= Date.parse(to.observedAt);
  return (
    <section className="panel comparison-panel" aria-labelledby="compare-title">
      <div className="panel-heading">
        <div>
          <h3 id="compare-title">D’un relevé à l’autre</h3>
          <p>Comparez deux relevés.</p>
        </div>
        <GitCompareArrows size={17} className="text-muted-foreground" />
      </div>
      {list.length < 2 ? (
        <div className="comparison-empty">
          <div className="comparison-symbol">
            <span>—</span>
            <ArrowRight size={16} />
            <span>—</span>
          </div>
          <strong>Deux relevés sont nécessaires</strong>
          <p>
            {list.length === 1
              ? "Ajoutez un deuxième relevé pour comparer vos observations."
              : "Ajoutez deux relevés pour comparer votre position, votre note et vos avis."}
          </p>
        </div>
      ) : (
        <>
          <div className="comparison-dates">
            <div>
              <label htmlFor="compare-from">DU RELEVÉ</label>
              <select
                id="compare-from"
                value={from?.id}
                onChange={(e) => setFromId(e.target.value)}
              >
                {list.map((o, i) => (
                  <option key={o.id} value={o.id}>
                    {formatDate(o.observedAt, true)} · n°{i + 1}
                  </option>
                ))}
              </select>
            </div>
            <ArrowRight
              size={14}
              className="text-muted-foreground mt-5 shrink-0"
            />
            <div>
              <label htmlFor="compare-to">AU RELEVÉ</label>
              <select
                id="compare-to"
                value={to?.id}
                onChange={(e) => setToId(e.target.value)}
              >
                {list.map((o, i) => (
                  <option key={o.id} value={o.id}>
                    {formatDate(o.observedAt, true)} · n°{i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!valid || !ascending ? (
            <p className="comparison-feedback" role="status">
              {!valid
                ? "Choisissez deux relevés différents."
                : "Le relevé de départ doit précéder celui d’arrivée."}
            </p>
          ) : (
            <>
              <div
                className={`comparison-result ${change === null || change === 0 ? "neutral" : change > 0 ? "positive" : "negative"}`}
              >
                {change !== null &&
                  change !== 0 &&
                  (change > 0 ? (
                    <ArrowUp size={21} />
                  ) : (
                    <ArrowDown size={21} />
                  ))}
                <strong>{change === null ? "—" : Math.abs(change)}</strong>
                <span>
                  {change === null
                    ? "Évolution non calculable"
                    : change === 0
                      ? "Position stable"
                      : `place${Math.abs(change) > 1 ? "s" : ""} ${change > 0 ? "gagnée" : "perdue"}${Math.abs(change) > 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="comparison-metrics">
                <div>
                  <span>Note moyenne</span>
                  <strong>
                    {from.rating.toLocaleString("fr-FR")}{" "}
                    <ArrowRight size={11} /> {to.rating.toLocaleString("fr-FR")}
                    <span>/5</span>
                  </strong>
                </div>
                <div>
                  <span>Nombre d’avis</span>
                  <strong>
                    {to.reviews - from.reviews > 0 ? "+" : ""}
                    {(to.reviews - from.reviews).toLocaleString("fr-FR")}{" "}
                    <span>avis</span>
                  </strong>
                </div>
              </div>
            </>
          )}
        </>
      )}
      <p className="comparison-footnote">
        Comparez dans les mêmes conditions de recherche.
      </p>
    </section>
  );
}
