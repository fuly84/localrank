"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  localDateTime,
  mapsUrl,
  type Observation,
  type Profile,
} from "@/lib/data";

export function ObservationDialog({
  profile,
  observation,
  onClose,
  onSave,
}: {
  profile: Profile;
  observation?: Observation;
  onClose: () => void;
  onSave: (o: Observation) => void;
}) {
  const [notFound, setNotFound] = useState(observation?.position === null);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = new Date(String(form.get("observedAt")));
    if (
      !Number.isFinite(date.getTime()) ||
      date.getTime() > Date.now() + 60000
    ) {
      setError(
        "Choisissez une date et une heure valides, dans le passé ou maintenant.",
      );
      return;
    }
    const position = notFound ? null : Number(form.get("position"));
    const rating = Number(form.get("rating"));
    const reviews = Number(form.get("reviews"));
    if (
      (!notFound &&
        (!Number.isInteger(position) || position! < 1 || position! > 1000)) ||
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5 ||
      !Number.isInteger(reviews) ||
      reviews < 0 ||
      reviews > 10000000
    ) {
      setError(
        "Vérifiez la position (1 à 1 000), la note (0 à 5) et le nombre d’avis.",
      );
      return;
    }
    if (reviews === 0 && rating > 0) {
      setError(
        "Un commerce sans avis doit avoir une note de 0. Vérifiez vos valeurs.",
      );
      return;
    }
    try {
      onSave({
        id: observation?.id ?? crypto.randomUUID(),
        profileId: profile.id,
        observedAt: date.toISOString(),
        position,
        rating,
        reviews,
        notes: String(form.get("notes") ?? "").trim(),
      });
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de sauvegarder le relevé.",
      );
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="observation-modal sm:max-w-[510px]">
        <DialogHeader>
          <div className="eyebrow mb-2">OBSERVATION MANUELLE</div>
          <DialogTitle>
            {observation ? "Modifier le relevé" : "Ajouter un relevé"}
          </DialogTitle>
          <DialogDescription>
            {profile.name} · {profile.keyword}
          </DialogDescription>
        </DialogHeader>
        <a
          href={mapsUrl(profile)}
          target="_blank"
          rel="noopener noreferrer"
          className="maps-dialog-link"
        >
          <span>Ouvrir la recherche Google Maps</span>
          <ArrowUpRight size={17} />
        </a>
        <div className="manual-note">
          <Info size={15} />
          <p>
            Repérez votre commerce dans les résultats{" "}
            <strong>hors annonces</strong>. Les valeurs ci-dessous sont saisies
            par vous et ne sont pas vérifiées automatiquement.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="observed-at">Date et heure du relevé</Label>
            <Input
              type="datetime-local"
              id="observed-at"
              name="observedAt"
              required
              max={localDateTime()}
              defaultValue={localDateTime(
                observation ? new Date(observation.observedAt) : new Date(),
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                type="number"
                min={1}
                max={1000}
                step={1}
                placeholder="Ex. 8"
                defaultValue={observation?.position ?? ""}
                required={!notFound}
                disabled={notFound}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Note / 5</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min={0}
                max={5}
                step="0.1"
                placeholder="Ex. 4,8"
                defaultValue={observation?.rating ?? ""}
                required
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviews">Nombre d’avis</Label>
              <Input
                id="reviews"
                name="reviews"
                type="number"
                min={0}
                max={10000000}
                step={1}
                placeholder="Ex. 103"
                defaultValue={observation?.reviews ?? ""}
                required
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="not-found"
              checked={notFound}
              onCheckedChange={(v) => setNotFound(v === true)}
            />
            <Label
              htmlFor="not-found"
              className="text-xs font-normal text-muted-foreground"
            >
              Je n’ai pas trouvé mon commerce dans les résultats consultés
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">
              Une note pour plus tard{" "}
              <span className="font-normal text-muted-foreground">
                (facultatif)
              </span>
            </Label>
            <textarea
              id="notes"
              name="notes"
              maxLength={500}
              rows={2}
              className="notes-input"
              placeholder="Ex. Recherche depuis le centre-ville, sur mobile…"
              defaultValue={observation?.notes ?? ""}
            />
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button className="w-full h-11" type="submit">
            <Check size={16} />
            {observation
              ? "Enregistrer les modifications"
              : "Enregistrer mon relevé"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Enregistré uniquement dans ce navigateur.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
