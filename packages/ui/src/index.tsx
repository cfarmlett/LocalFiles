import type { ReactNode } from "react";

export type SectionProps = Readonly<{
  id: string;
  title: string;
  children: ReactNode;
}>;

export function Section({ id, title, children }: SectionProps) {
  return (
    <section className="section" id={id} aria-labelledby={`${id}-title`}>
      <div className="section__inner">
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

export type PlaceholderPanelProps = Readonly<{
  title: string;
  status: string;
  children: ReactNode;
}>;

export function PlaceholderPanel({
  title,
  status,
  children,
}: PlaceholderPanelProps) {
  return (
    <article className="placeholder-panel">
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
      <span className="status-label">{status}</span>
    </article>
  );
}

export type PrivacyNoteProps = Readonly<{
  children: ReactNode;
}>;

export function PrivacyNote({ children }: PrivacyNoteProps) {
  return <p className="privacy-note">{children}</p>;
}
