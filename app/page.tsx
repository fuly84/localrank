"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  Github,
  HardDrive,
  History,
  Info,
  LocateFixed,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo, LocalMap } from "@/components/brand";
import { ProfileForm } from "@/components/profile-form";
import { ObservationDialog } from "@/components/observation-dialog";
import { DataDialog } from "@/components/data-dialog";
import { RankChart } from "@/components/rank-chart";
import { Comparison } from "@/components/comparison";
import {
  chronological,
  downloadFile,
  formatDate,
  mapsUrl,
  rankChange,
  toCsv,
  type Observation,
  type Profile,
} from "@/lib/data";
import { createDemo } from "@/lib/demo";
import { updateData, useLocalData } from "@/lib/store";

const REPOSITORY = "https://github.com/fuly84/localrank";

export default function Home() {
  const stored = useLocalData();
  const [demo, setDemo] = useState(false);
  const [demoData] = useState(createDemo);
  const [observationModal, setObservationModal] = useState<
    "new" | Observation | null
  >(null);
  const [dataModal, setDataModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [deletion, setDeletion] = useState<{
    type: "profile" | "observation";
    id: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [historyLimit, setHistoryLimit] = useState(5);
  const data = demo ? demoData : stored.data;
  const profile =
    data.profiles.find((p) => p.id === data.activeProfileId) ??
    data.profiles[0];
  const observations = useMemo(
    () =>
      chronological(
        data.observations.filter((o) => o.profileId === profile?.id),
      ),
    [data.observations, profile?.id],
  );
  const latest = observations.at(-1);
  const previous = observations.at(-2);
  const change = rankChange(previous, latest);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);

  function act(action: () => void, success?: string) {
    try {
      action();
      setActionError("");
      if (success) setMessage(success);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Une erreur est survenue.",
      );
    }
  }

  function createProfile(fields: Pick<Profile, "name" | "city" | "keyword">) {
    if (stored.error) throw new Error(stored.error);
    updateData((current) => {
      const same = current.profiles.find(
        (p) =>
          [p.name, p.city, p.keyword]
            .map((s) => s.toLocaleLowerCase("fr"))
            .join("|") ===
          [fields.name, fields.city, fields.keyword]
            .map((s) => s.toLocaleLowerCase("fr"))
            .join("|"),
      );
      if (same) return { ...current, activeProfileId: same.id };
      if (current.profiles.length >= 100)
        throw new Error(
          "Vous avez atteint la limite de 100 suivis. Supprimez un suivi pour continuer.",
        );
      const next: Profile = {
        ...fields,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...current,
        profiles: [...current.profiles, next],
        activeProfileId: next.id,
      };
    });
    setDemo(false);
    setHistoryLimit(5);
    setMessage(
      "Votre suivi est prêt. Ouvrez Google Maps pour votre premier relevé.",
    );
    document
      .getElementById("dashboard")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveObservation(observation: Observation) {
    updateData((current) => {
      if (!current.profiles.some((p) => p.id === observation.profileId))
        throw new Error(
          "Ce suivi a été supprimé dans un autre onglet. Rechargez la page.",
        );
      const existing = current.observations.find(
        (o) => o.id === observation.id,
      );
      return {
        ...current,
        observations: existing
          ? current.observations.map((o) =>
              o.id === observation.id ? observation : o,
            )
          : [...current.observations, observation],
      };
    });
    setMessage("Relevé enregistré dans ce navigateur.");
  }

  function confirmDelete() {
    if (!deletion) return;
    act(
      () => {
        updateData((current) =>
          deletion.type === "profile"
            ? {
                ...current,
                profiles: current.profiles.filter((p) => p.id !== deletion.id),
                observations: current.observations.filter(
                  (o) => o.profileId !== deletion.id,
                ),
                activeProfileId:
                  current.activeProfileId === deletion.id
                    ? (current.profiles.find((p) => p.id !== deletion.id)?.id ??
                      null)
                    : current.activeProfileId,
              }
            : {
                ...current,
                observations: current.observations.filter(
                  (o) => o.id !== deletion.id,
                ),
              },
        );
        setDeletion(null);
      },
      deletion.type === "profile" ? "Suivi supprimé." : "Relevé supprimé.",
    );
  }

  return (
    <>
      <a href="#dashboard" className="skip-link">
        Aller au tableau de bord
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <a href="#" aria-label="LocalRank, accueil">
            <Logo />
          </a>
          <nav aria-label="Navigation principale" className="desktop-nav">
            <a href="#dashboard">Tableau de bord</a>
            <a href="#comment-ca-marche">Comment ça marche</a>
          </nav>
          <div className="header-actions">
            <a
              href={REPOSITORY}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              <Github size={16} />
              <span>Open source</span>
              <ArrowUpRight size={12} />
            </a>
            <span className="header-separator" />
            <a href="#commencer" className="header-cta">
              Commencer <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="shell hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="hero-badge">
              <span className="blue-dot" />
              La visibilité locale, en toute simplicité
              <ChevronRight size={12} />
            </span>
            <h1 id="hero-title">
              Votre commerce.
              <br />
              <span>À la bonne place.</span>
            </h1>
            <p>
              Suivez votre visibilité sur Google Maps.
              <br className="hidden sm:block" /> Saisissez vos observations et
              comparez vos positions dans le temps.
            </p>
            <div className="hero-proofs">
              <span>
                <Check size={13} />
                100 % gratuit
              </span>
              <span>
                <Check size={13} />
                Sans compte
              </span>
              <span>
                <Check size={13} />
                Vos données chez vous
              </span>
            </div>
          </div>
          <LocalMap />
        </section>

        <div className="shell">
          <ProfileForm onCreate={createProfile} ready={stored.ready} />
          <div className="trust-line">
            <LockKeyhole size={12} />
            <span>
              Aucune connexion à Google. Vous observez, LocalRank vous aide à
              suivre.
            </span>
            <button
              onClick={() => setHelpModal(true)}
              aria-label="En savoir plus sur les relevés manuels"
            >
              <CircleHelp size={13} />
            </button>
          </div>
        </div>

        <section
          id="dashboard"
          className="dashboard-section scroll-mt-20"
          aria-labelledby="dashboard-title"
        >
          <div className="shell">
            <div className="dashboard-heading">
              <div>
                <h2 id="dashboard-title">
                  Votre visibilité, en clair
                  <span className="text-primary">.</span>
                </h2>
                <p>Vos derniers chiffres et l’historique de vos relevés.</p>
              </div>
              <div className="dashboard-actions">
                <button
                  className="demo-button"
                  onClick={() => {
                    setDemo(!demo);
                    setHistoryLimit(5);
                  }}
                >
                  {demo ? <X size={14} /> : <Sparkles size={14} />}
                  {demo ? "Quitter la démo" : "Explorer la démo"}
                </button>
                <Button
                  disabled={!profile || demo || !!stored.error}
                  onClick={() => setObservationModal("new")}
                >
                  <Plus size={16} />
                  Nouveau relevé
                </Button>
              </div>
            </div>

            {demo && (
              <div className="demo-banner" role="status">
                <Sparkles size={16} />
                <div>
                  <strong>Mode démo · données entièrement fictives</strong>
                  <span>
                    Cet exemple illustre l’outil. Il ne représente aucun
                    résultat Google et n’est pas sauvegardé.
                  </span>
                </div>
                <button
                  onClick={() => setDemo(false)}
                  aria-label="Quitter la démonstration"
                >
                  <X size={17} />
                </button>
              </div>
            )}
            {(stored.error || actionError) && (
              <div role="alert" className="error-banner">
                <Info size={17} />
                <p>{actionError || stored.error}</p>
                <button onClick={() => setDataModal(true)}>Mes données</button>
              </div>
            )}

            <div className="workspace-bar">
              <div className="workspace-profile">
                <span className="store-avatar">
                  <Store size={18} />
                </span>
                <div>
                  {profile ? (
                    <>
                      <label className="sr-only" htmlFor="active-profile">
                        Suivi actif
                      </label>
                      <select
                        id="active-profile"
                        className="profile-select"
                        value={profile.id}
                        disabled={demo}
                        onChange={(e) =>
                          act(() => {
                            updateData((current) => ({
                              ...current,
                              activeProfileId: e.target.value,
                            }));
                            setHistoryLimit(5);
                          })
                        }
                      >
                        {data.profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {p.keyword}
                          </option>
                        ))}
                      </select>
                      <span className="profile-location">
                        <MapPin size={10} />
                        {profile.city}
                        <span className="dot-separator">·</span>
                        {profile.keyword}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>Votre espace de suivi</strong>
                      <span className="profile-location">
                        Créez votre premier suivi dans le formulaire ci-dessus.
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="workspace-tools">
                {profile && !demo && (
                  <a
                    href={mapsUrl(profile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ouvrir la recherche sur Google Maps"
                    title="Ouvrir Google Maps"
                  >
                    <MapPin size={16} />
                  </a>
                )}
                <span className="local-label">
                  <i className="green-dot" />
                  {demo ? "Exemple fictif" : "Stockage local"}
                </span>
                <button
                  aria-label="Gérer mes données et sauvegardes"
                  title="Mes données et sauvegardes"
                  onClick={() => setDataModal(true)}
                >
                  <HardDrive size={16} />
                </button>
                {profile && !demo && (
                  <button
                    aria-label="Supprimer le suivi actif"
                    title="Supprimer ce suivi"
                    onClick={() =>
                      setDeletion({ type: "profile", id: profile.id })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {profile && !demo && !latest && (
              <div className="first-step">
                <div className="first-step-icon">
                  <LocateFixed size={21} />
                </div>
                <div>
                  <strong>Ajoutez votre premier relevé</strong>
                  <p>
                    Ouvrez la recherche, repérez « {profile.name} », puis
                    ajoutez votre premier relevé.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a
                    href={mapsUrl(profile)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ouvrir Google Maps <ArrowUpRight size={14} />
                  </a>
                </Button>
              </div>
            )}

            <div className="stats-grid">
              <StatCard
                label="Position observée"
                icon={<LocateFixed size={16} />}
                value={
                  latest
                    ? latest.position === null
                      ? "Non trouvé"
                      : `#${latest.position}`
                    : "—"
                }
                detail={
                  latest
                    ? formatDate(latest.observedAt, true)
                    : "En attente de votre premier relevé"
                }
                tag={
                  latest?.position != null && latest.position <= 3
                    ? "Top 3"
                    : undefined
                }
              />
              <StatCard
                label="Note Google saisie"
                icon={<Star size={16} />}
                value={
                  latest
                    ? latest.rating.toLocaleString("fr-FR", {
                        minimumFractionDigits: 1,
                      })
                    : "—"
                }
                suffix="/ 5"
                detail={
                  latest
                    ? "Note saisie manuellement"
                    : "Aucun relevé enregistré"
                }
              />
              <StatCard
                label="Nombre d’avis"
                icon={<MessageSquare size={16} />}
                value={latest ? latest.reviews.toLocaleString("fr-FR") : "—"}
                detail={
                  previous && latest
                    ? `${latest.reviews - previous.reviews >= 0 ? "+" : ""}${latest.reviews - previous.reviews} depuis le relevé précédent`
                    : latest
                      ? "Premier relevé enregistré"
                      : "Aucun relevé enregistré"
                }
              />
              <StatCard
                label="Évolution de la position"
                icon={<TrendingUp size={16} />}
                value={
                  change === null
                    ? "—"
                    : change === 0
                      ? "0"
                      : `${change > 0 ? "+" : "−"}${Math.abs(change)}`
                }
                suffix={
                  change !== null
                    ? Math.abs(change) === 1
                      ? "place"
                      : "places"
                    : undefined
                }
                detail={
                  observations.length < 2
                    ? "Disponible à partir de 2 relevés"
                    : change === null
                      ? "Position non trouvée : non calculable"
                      : "Par rapport au relevé précédent"
                }
                direction={
                  change === null || change === 0
                    ? undefined
                    : change > 0
                      ? "up"
                      : "down"
                }
              />
            </div>

            <div className="analytics-grid">
              <RankChart
                key={`chart-${profile?.id ?? "empty"}`}
                observations={observations}
              />
              <Comparison
                key={`comparison-${profile?.id ?? "empty"}`}
                observations={observations}
              />
            </div>

            <section
              className="panel history-panel"
              aria-labelledby="history-title"
            >
              <div className="panel-heading">
                <div className="history-heading">
                  <h3 id="history-title">Historique des relevés</h3>
                  <span className="count-badge">{observations.length}</span>
                </div>
                <button
                  className="export-button"
                  disabled={!latest || demo}
                  onClick={() => {
                    if (profile) {
                      downloadFile(
                        toCsv(profile, observations),
                        `localrank-releves-${new Date().toISOString().slice(0, 10)}.csv`,
                        "text/csv;charset=utf-8;",
                      );
                      setMessage("Export CSV lancé.");
                    }
                  }}
                >
                  <Download size={14} />
                  <span>Exporter en CSV</span>
                </button>
              </div>
              {observations.length ? (
                <>
                  <div className="table-scroll">
                    <table>
                      <caption className="sr-only">
                        Historique des observations manuelles pour{" "}
                        {profile?.name}. Données non vérifiées automatiquement.
                      </caption>
                      <thead>
                        <tr>
                          <th>Date du relevé</th>
                          <th>Position</th>
                          <th>Note</th>
                          <th>Avis</th>
                          <th>Évolution</th>
                          <th>Source</th>
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...observations]
                          .reverse()
                          .slice(0, historyLimit)
                          .map((o) => {
                            const index = observations.findIndex(
                              (item) => item.id === o.id,
                            );
                            const delta = rankChange(
                              observations[index - 1],
                              o,
                            );
                            return (
                              <tr key={o.id}>
                                <td>
                                  <strong>{formatDate(o.observedAt)}</strong>
                                  <span className="table-time">
                                    {new Date(o.observedAt).toLocaleTimeString(
                                      "fr-FR",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </span>
                                  {o.notes && (
                                    <span
                                      className="table-note"
                                      title={o.notes}
                                    >
                                      {o.notes}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`rank-badge ${o.position !== null && o.position <= 3 ? "top-rank" : ""}`}
                                  >
                                    {o.position === null
                                      ? "Non trouvé"
                                      : `#${o.position}`}
                                  </span>
                                </td>
                                <td>
                                  <span className="table-rating">
                                    <Star size={11} fill="currentColor" />
                                    {o.rating.toLocaleString("fr-FR", {
                                      minimumFractionDigits: 1,
                                    })}
                                  </span>
                                </td>
                                <td>{o.reviews.toLocaleString("fr-FR")}</td>
                                <td>
                                  <span
                                    className={
                                      delta === null || delta === 0
                                        ? "text-muted-foreground"
                                        : delta > 0
                                          ? "text-emerald-700"
                                          : "text-rose-700"
                                    }
                                  >
                                    {delta === null ? (
                                      "—"
                                    ) : (
                                      <span className="inline-flex items-center gap-1">
                                        {delta === 0 ? (
                                          <ArrowRight size={12} />
                                        ) : delta > 0 ? (
                                          <ArrowUp size={12} />
                                        ) : (
                                          <ArrowDown size={12} />
                                        )}
                                        {Math.abs(delta)}
                                      </span>
                                    )}
                                  </span>
                                </td>
                                <td>
                                  <Badge
                                    variant="outline"
                                    className="manual-badge"
                                  >
                                    <Pencil size={9} />
                                    {demo ? "Fictif" : "Manuel"}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="table-actions">
                                    <button
                                      disabled={demo}
                                      aria-label={`Modifier le relevé du ${formatDate(o.observedAt, true)}`}
                                      title="Modifier"
                                      onClick={() => setObservationModal(o)}
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      disabled={demo}
                                      aria-label={`Supprimer le relevé du ${formatDate(o.observedAt, true)}`}
                                      title="Supprimer"
                                      onClick={() =>
                                        setDeletion({
                                          type: "observation",
                                          id: o.id,
                                        })
                                      }
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {observations.length > historyLimit && (
                    <button
                      className="load-more"
                      onClick={() => setHistoryLimit((limit) => limit + 10)}
                    >
                      Afficher plus de relevés <ArrowDown size={12} />
                    </button>
                  )}
                </>
              ) : (
                <div className="history-empty">
                  <span>
                    <History size={21} strokeWidth={1.5} />
                  </span>
                  <div>
                    <strong>Aucun relevé enregistré</strong>
                    <p>Ajoutez un relevé pour commencer votre historique.</p>
                  </div>
                  {profile && (
                    <button onClick={() => setObservationModal("new")}>
                      Ajouter un relevé <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}
              <div className="history-footer">
                <ShieldCheck size={12} />
                <span>
                  Relevés manuels, non vérifiés par Google. Les résultats
                  varient selon votre localisation et votre contexte de
                  recherche.
                </span>
              </div>
            </section>
            <div className="dashboard-bottom">
              <span>
                <LockKeyhole size={12} />
                Données enregistrées dans ce navigateur uniquement.
              </span>
              <button onClick={() => setDataModal(true)}>
                Gérer mes données <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </section>

        <section
          id="comment-ca-marche"
          className="shell how-section scroll-mt-24"
          aria-labelledby="how-title"
        >
          <div className="how-heading">
            <span className="eyebrow">SIMPLE PAR CHOIX</span>
            <h2 id="how-title">Comment ça marche</h2>
            <p>
              Ouvrez Google Maps, saisissez vos observations,
              <br />
              puis suivez leur évolution.
            </p>
          </div>
          <div className="how-steps">
            <HowStep
              number="01"
              icon={<Search size={17} />}
              title="Ouvrez votre recherche"
              text="Renseignez votre commerce et votre mot-clé. LocalRank prépare le lien vers la recherche Google Maps."
            />
            <HowStep
              number="02"
              icon={<Pencil size={17} />}
              title="Saisissez vos observations"
              text="Saisissez votre position, votre note et vos avis. Pour comparer, gardez le même lieu et les mêmes conditions."
            />
            <HowStep
              number="03"
              icon={<ChartNoAxesCombined size={17} />}
              title="Comparez vos relevés"
              text="Retrouvez vos relevés, comparez deux dates et suivez votre évolution. À votre rythme, sans abonnement."
            />
          </div>
        </section>

        <div className="shell">
          <div className="open-source-strip">
            <span className="open-source-icon">
              <Github size={25} strokeWidth={1.6} />
            </span>
            <div>
              <strong>Code source disponible.</strong>
              <p>
                Sous licence MIT. Consultez, modifiez ou partagez le projet.
              </p>
            </div>
            <a href={REPOSITORY} target="_blank" rel="noopener noreferrer">
              Découvrir le code <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </main>

      <footer className="shell site-footer">
        <Logo />
        <span>Suivi manuel de visibilité sur Google Maps.</span>
        <div>
          <span>Indépendant de Google</span>
          <span className="dot-separator">·</span>
          <a
            href={REPOSITORY + "/blob/main/LICENSE"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Licence MIT <ArrowUpRight size={11} />
          </a>
        </div>
      </footer>

      {message && (
        <div role="status" className="toast">
          <span>
            <Check size={14} />
          </span>
          {message}
          <button
            aria-label="Fermer la notification"
            onClick={() => setMessage("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {observationModal && profile && !demo && (
        <ObservationDialog
          key={
            typeof observationModal === "string" ? "new" : observationModal.id
          }
          profile={profile}
          observation={
            typeof observationModal === "string" ? undefined : observationModal
          }
          onClose={() => setObservationModal(null)}
          onSave={saveObservation}
        />
      )}
      {dataModal && (
        <DataDialog
          data={stored.data}
          onClose={() => setDataModal(false)}
          onImported={() => {
            setDemo(false);
            setMessage("Sauvegarde importée.");
          }}
        />
      )}
      {deletion && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setDeletion(null);
          }}
        >
          <DialogContent className="sm:max-w-[430px]">
            <DialogHeader>
              <DialogTitle>
                {deletion.type === "profile"
                  ? "Supprimer ce suivi ?"
                  : "Supprimer ce relevé ?"}
              </DialogTitle>
              <DialogDescription>
                {deletion.type === "profile"
                  ? "Ce suivi et tous ses relevés seront supprimés de ce navigateur. Exportez une sauvegarde avant de continuer."
                  : "Ce relevé sera supprimé de l’historique. Cette action est définitive sans sauvegarde."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setDeletion(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {helpModal && (
        <Dialog open onOpenChange={setHelpModal}>
          <DialogContent className="sm:max-w-[475px]">
            <DialogHeader>
              <DialogTitle>Une observation, en toute transparence.</DialogTitle>
              <DialogDescription>
                LocalRank ne récupère aucun classement auprès de Google.
              </DialogDescription>
            </DialogHeader>
            <div className="help-content">
              <p>
                Le lien ouvre la recherche de votre{" "}
                <strong>mot-clé dans votre ville</strong>, sans ajouter le nom
                de votre commerce pour ne pas biaiser le résultat.
              </p>
              <p>
                Repérez votre commerce dans les résultats hors annonces, puis
                saisissez les valeurs observées. Une position varie selon le
                lieu, l’appareil, le compte connecté et le moment de la
                recherche.
              </p>
              <p>
                Pour suivre une tendance utile, répétez vos observations dans
                des conditions comparables. Aucun relevé n’est automatiquement
                vérifié.
              </p>
            </div>
            <Button onClick={() => setHelpModal(false)}>C’est compris</Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function StatCard({
  label,
  icon,
  value,
  suffix,
  detail,
  tag,
  direction,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  suffix?: string;
  detail: string;
  tag?: string;
  direction?: "up" | "down";
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <span>{label}</span>
        {icon}
      </div>
      <div
        className={`stat-value ${direction === "up" ? "text-emerald-700" : direction === "down" ? "text-rose-700" : ""}`}
      >
        {direction &&
          (direction === "up" ? (
            <ArrowUp size={24} />
          ) : (
            <ArrowDown size={24} />
          ))}
        <strong className={value === "Non trouvé" ? "unranked-value" : ""}>
          {value}
        </strong>
        {suffix && <span>{suffix}</span>}
        {tag && (
          <span className="top-three-tag">
            <TrendingUp size={11} />
            {tag}
          </span>
        )}
      </div>
      <p>{detail}</p>
    </div>
  );
}

function HowStep({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="how-step">
      <div className="how-step-icon">{icon}</div>
      <div>
        <span>{number}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}
