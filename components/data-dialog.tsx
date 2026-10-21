"use client";

import { useRef, useState } from "react";
import { Download, HardDrive, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadFile, parseData, type LocalData } from "@/lib/data";
import { saveData } from "@/lib/store";

export function DataDialog({
  data,
  onClose,
  onImported,
}: {
  data: LocalData;
  onClose: () => void;
  onImported: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<LocalData | null>(null);
  const [error, setError] = useState("");
  const [exported, setExported] = useState(false);
  async function importFile(file?: File) {
    if (!file) return;
    setPending(null);
    setError("");
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Le fichier doit faire moins de 5 Mo.");
      const parsed = parseData(JSON.parse(await file.text()));
      setPending(parsed);
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "Ce fichier n’est pas un fichier JSON valide."
          : e instanceof Error
            ? e.message
            : "Import impossible.",
      );
    }
    if (input.current) input.current.value = "";
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <span className="data-icon">
            <HardDrive size={22} />
          </span>
          <DialogTitle>Vos données, chez vous.</DialogTitle>
          <DialogDescription>
            LocalRank enregistre vos suivis uniquement dans le stockage local de
            ce navigateur. Aucun compte, aucune base de données.
          </DialogDescription>
        </DialogHeader>
        <div className="data-summary">
          <span>
            {data.profiles.length} suivi{data.profiles.length > 1 ? "s" : ""}
          </span>
          <span>
            {data.observations.length} relevé
            {data.observations.length > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="green-dot" />
            Stockage local
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Les données ne sont pas synchronisées entre appareils. Effacer les
          données de navigation ou changer de navigateur peut les rendre
          indisponibles. Exportez une sauvegarde pour les conserver.
        </p>
        <Button
          className="h-11"
          onClick={() => {
            downloadFile(
              JSON.stringify(data, null, 2),
              `localrank-backup-${new Date().toISOString().slice(0, 10)}.json`,
              "application/json",
            );
            setExported(true);
          }}
        >
          <Download size={16} />
          Exporter une sauvegarde JSON
        </Button>
        {exported && (
          <p role="status" className="text-xs text-emerald-700">
            Le téléchargement de votre sauvegarde a été lancé.
          </p>
        )}
        <Button
          variant="outline"
          className="h-11"
          onClick={() => input.current?.click()}
        >
          <Upload size={16} />
          Importer une sauvegarde
        </Button>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Fichier de sauvegarde LocalRank"
          onChange={(event) => void importFile(event.target.files?.[0])}
        />
        {pending && (
          <div className="import-confirm">
            <strong>Remplacer les données actuelles ?</strong>
            <p>
              La sauvegarde contient {pending.profiles.length} suivi(s) et{" "}
              {pending.observations.length} relevé(s). Exportez vos données
              actuelles avant de continuer.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPending(null)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  try {
                    saveData(pending);
                    onImported();
                    onClose();
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "Import impossible.",
                    );
                  }
                }}
              >
                Remplacer et importer
              </Button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
