"use client";

import { AlertCircle } from "lucide-react";

/**
 * Primitives de formulaire — un seul endroit qui décide de l'allure d'un champ,
 * de son étiquette et de son message d'erreur.
 *
 * Accessibilité : chaque champ porte son `id`, son `<label for>`, et `aria-invalid` +
 * `aria-describedby` quand une erreur est affichée. Les erreurs viennent du serveur.
 */

const baseInput =
  "w-full rounded-md border bg-transparent px-4 py-3 text-body text-light-text outline-none transition-colors placeholder:text-light-muted/60 focus:border-leaf dark:text-dark-text dark:placeholder:text-dark-muted/60";

function stateClasses(error?: string) {
  return error
    ? "border-danger focus:border-danger"
    : "border-light-border dark:border-dark-border";
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-caption font-semibold text-light-text dark:text-dark-text"
      >
        {label}
        {required && (
          <span className="ms-1 text-danger" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-caption text-light-muted dark:text-dark-muted">{hint}</p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 inline-flex items-center gap-1.5 text-caption font-medium text-danger"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  id,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  return (
    <input
      id={id}
      name={props.name ?? id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${baseInput} ${stateClasses(error)}`}
      {...props}
    />
  );
}

export function TextArea({
  id,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string }) {
  return (
    <textarea
      id={id}
      name={props.name ?? id}
      rows={props.rows ?? 5}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${baseInput} ${stateClasses(error)} resize-y`}
      {...props}
    />
  );
}

export function Select({
  id,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { id: string; error?: string }) {
  return (
    <select
      id={id}
      name={props.name ?? id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${baseInput} ${stateClasses(error)} appearance-none bg-light-surface dark:bg-dark-surface`}
      {...props}
    >
      {children}
    </select>
  );
}

/** Case à cocher / bouton radio présenté comme une carte cliquable — confortable au doigt. */
export function OptionCard({
  type,
  name,
  value,
  label,
  hint,
  defaultChecked,
  accentColor,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  accentColor?: string;
}) {
  const id = `${name}-${value}`;
  return (
    <label
      htmlFor={id}
      className="group flex cursor-pointer items-start gap-3 rounded-md border border-light-border bg-light-surface p-4 transition-all has-[:checked]:border-leaf has-[:checked]:bg-leaf/8 has-[:checked]:shadow-card dark:border-dark-border dark:bg-dark-surface"
    >
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[--accent]"
        style={{ ["--accent" as string]: accentColor ?? "#2E9B4F" }}
      />
      <span>
        <span className="block text-[0.92rem] font-semibold text-light-text dark:text-dark-text">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-caption text-light-muted dark:text-dark-muted">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

export function Toggle({
  id,
  name,
  label,
  hint,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-md border border-light-border bg-light-surface p-4 dark:border-dark-border dark:bg-dark-surface"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-leaf"
      />
      <span>
        <span className="block text-[0.92rem] font-semibold text-light-text dark:text-dark-text">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-caption text-light-muted dark:text-dark-muted">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}
