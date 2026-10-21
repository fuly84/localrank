"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, MapPin, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  onCreate,
  ready,
}: {
  onCreate: (fields: { name: string; city: string; keyword: string }) => void;
  ready: boolean;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fields = {
      name: String(form.get("name")).trim(),
      city: String(form.get("city")).trim(),
      keyword: String(form.get("keyword")).trim(),
    };
    if (Object.values(fields).some((value) => !value)) {
      setError("Renseignez les trois champs pour créer votre suivi.");
      return;
    }
    try {
      onCreate(fields);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de créer ce suivi.",
      );
    }
  }
  return (
    <div id="commencer" className="setup-panel scroll-mt-24">
      <div className="setup-title">
        <span className="step-number">01</span>
        <span>Créer un suivi</span>
        <span className="setup-free">
          Sans inscription <ArrowRight size={12} />
        </span>
      </div>
      <form onSubmit={submit} className="setup-form">
        <div className="space-y-2">
          <Label htmlFor="business-name">Nom du commerce</Label>
          <div className="input-icon">
            <Store size={16} />
            <Input
              id="business-name"
              name="name"
              placeholder="Ex. Atelier Juniper"
              maxLength={100}
              required
              autoComplete="organization"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-city">Ville</Label>
          <div className="input-icon">
            <MapPin size={16} />
            <Input
              id="business-city"
              name="city"
              placeholder="Ex. Lyon"
              maxLength={100}
              required
              autoComplete="address-level2"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-keyword">Mot-clé à suivre</Label>
          <div className="input-icon">
            <Search size={16} />
            <Input
              id="business-keyword"
              name="keyword"
              placeholder="Ex. fleuriste Lyon"
              maxLength={150}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          className="create-button"
          disabled={!ready}
        >
          Créer mon suivi <ArrowRight size={16} />
        </Button>
      </form>
      {error && (
        <p role="alert" className="form-error mt-3">
          {error}
        </p>
      )}
    </div>
  );
}
