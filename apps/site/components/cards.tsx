import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin, UserCheck } from "lucide-react";
import {
  formatDate,
  formatTime,
  getProgram,
  localePath,
  type Dictionary,
  type Locale,
  type Program,
} from "@qardan/shared";
import type { ArticleMeta, ArticleText, EventMeta, EventText, SiteUi } from "@/content";
import { Icon } from "./Icon";
import { ArrowLink, ProgramBadge } from "./ui";

/** Carte de programme — utilisée sur l'accueil et sur la page Programmes. */
export function ProgramCard({
  program,
  locale,
  dict,
  ui,
  delay = 0,
}: {
  program: Program;
  locale: Locale;
  dict: Dictionary;
  ui: SiteUi;
  delay?: number;
}) {
  const labels = dict.programs[program.slug];

  return (
    <article
      data-reveal
      data-reveal-delay={delay}
      className="lift relative flex flex-col overflow-hidden rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
    >
      {/* Filet de couleur : identifie le programme sans recourir à une image. */}
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: program.color }}
        aria-hidden
      />
      <span
        className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md"
        style={{ backgroundColor: `${program.color}1A`, color: program.color }}
      >
        <Icon name={program.icon} className="h-6 w-6" />
      </span>

      <h3 className="font-display text-h2 text-light-text dark:text-dark-text">{labels.name}</h3>
      <p className="mt-2 text-[0.95rem] italic text-light-muted dark:text-dark-muted">
        {labels.tagline}
      </p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {labels.actions.map((action) => (
          <li
            key={action}
            className="flex gap-2.5 text-[0.9rem] leading-relaxed text-light-muted dark:text-dark-muted"
          >
            <span
              className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: program.color }}
              aria-hidden
            />
            {action}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-center justify-between border-t border-light-border pt-5 dark:border-dark-border">
        <ArrowLink href={localePath(locale, `/programmes/${program.slug}`)}>
          {ui.programs.discover}
        </ArrowLink>
        <Link
          href={localePath(locale, `/don?programme=${program.slug}`)}
          className="text-caption font-semibold text-light-muted transition-colors hover:text-accent dark:text-dark-muted"
        >
          {ui.programs.support}
        </Link>
      </div>
    </article>
  );
}

/** Carte d'article — liste d'actualités et bloc « dernières nouvelles » de l'accueil. */
export function ArticleCard({
  meta,
  text,
  locale,
  dict,
  ui,
  delay = 0,
  featured = false,
}: {
  meta: ArticleMeta;
  text: ArticleText;
  locale: Locale;
  dict: Dictionary;
  ui: SiteUi;
  delay?: number;
  featured?: boolean;
}) {
  const program = getProgram(meta.program);

  return (
    <article
      data-reveal
      data-reveal-delay={delay}
      className={`lift group flex flex-col overflow-hidden rounded-lg border border-light-border bg-light-surface shadow-card dark:border-dark-border dark:bg-dark-surface ${
        featured ? "md:flex-row" : ""
      }`}
    >
      {/* Vignette générative : dégradé de la couleur du programme.
          ➜ À remplacer par la photo réelle de l'action dès que le client fournit ses visuels. */}
      <div
        className={`relative flex shrink-0 items-end overflow-hidden p-5 ${
          featured ? "md:min-h-[280px] md:w-2/5" : "h-40"
        }`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${program?.color ?? "#0F5C2E"} 0%, #052316 130%)`,
        }}
      >
        <div className="pattern-weave absolute inset-0 opacity-70" aria-hidden />
        <span className="relative text-caption font-semibold uppercase tracking-[0.14em] text-white/85">
          {dict.programs[meta.program].name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-caption text-light-muted dark:text-dark-muted">
          <time dateTime={meta.date}>{formatDate(meta.date, locale)}</time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {meta.readingMinutes} {ui.common.minRead}
          </span>
        </div>

        <h3
          className={`font-display ${featured ? "text-h1" : "text-h3"} text-light-text dark:text-dark-text`}
        >
          <Link
            href={localePath(locale, `/actualites/${meta.slug}`)}
            className="after:absolute after:inset-0"
          >
            {text.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
          {text.excerpt}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-primary dark:text-leaf">
          {ui.common.readArticle}
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
            aria-hidden
          />
        </span>
      </div>
    </article>
  );
}

/** Carte d'événement — agenda public. */
export function EventCard({
  meta,
  text,
  locale,
  dict,
  ui,
  delay = 0,
  past = false,
}: {
  meta: EventMeta;
  text: EventText;
  locale: Locale;
  dict: Dictionary;
  ui: SiteUi;
  delay?: number;
  past?: boolean;
}) {
  const program = getProgram(meta.program);
  const date = new Date(meta.startsAt);

  return (
    <article
      data-reveal
      data-reveal-delay={delay}
      className={`lift flex gap-5 rounded-lg border border-light-border bg-light-surface p-6 shadow-card dark:border-dark-border dark:bg-dark-surface ${
        past ? "opacity-70" : ""
      }`}
    >
      {/*
        Bloc date — repère visuel fort dans une liste.
        Le jour et l'année restent en chiffres occidentaux (`ltr-nums`), mais le mois est
        écrit dans la langue de la page : un lecteur arabophone doit lire « أغسطس », pas
        « Aug ». Le mois arabe étant plus long, il n'est ni en capitales ni espacé.
      */}
      <div
        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-md px-1 text-center text-white"
        style={{ backgroundColor: program?.color ?? "#0F5C2E" }}
      >
        <span className="ltr-nums font-display text-2xl font-extrabold leading-none">
          {date.getDate().toString().padStart(2, "0")}
        </span>
        <span
          className={`mt-1 leading-tight ${
            locale === "ar" ? "text-[0.7rem]" : "text-caption uppercase tracking-wider"
          }`}
        >
          {formatDate(meta.startsAt, locale, { month: "short" }).replace(".", "")}
        </span>
        <span className="ltr-nums text-[0.65rem] text-white/70">{date.getFullYear()}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {program && (
            <ProgramBadge name={dict.programs[meta.program].name} color={program.color} />
          )}
          {meta.registration && !past && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-caption font-semibold text-accent-hover">
              <UserCheck className="h-3.5 w-3.5" aria-hidden />
              {ui.events.registration}
            </span>
          )}
        </div>

        <h3 className="font-display text-h3 text-light-text dark:text-dark-text">{text.title}</h3>

        <p className="mt-2 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
          {text.description}
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-caption text-light-muted dark:text-dark-muted">
          <div className="inline-flex items-center gap-1.5">
            <dt className="sr-only">{ui.events.scheduleAria}</dt>
            <CalendarDays className="h-4 w-4 text-leaf" aria-hidden />
            <dd>
              {formatDate(meta.startsAt, locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              {ui.events.at} {formatTime(meta.startsAt, locale)}
            </dd>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <dt className="sr-only">{ui.events.placeAria}</dt>
            <MapPin className="h-4 w-4 text-leaf" aria-hidden />
            <dd>
              {text.place}
              {ui.common.comma}
              {text.city}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
