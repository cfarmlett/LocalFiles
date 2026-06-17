import { useMemo, useState } from "react";

import { PlaceholderPanel, PrivacyNote, Section } from "@localdocs/ui";

import { DeletePagesPage } from "./DeletePagesPage";
import { MergePdfPage } from "./MergePdfPage";
import { ReorderPagesPage } from "./ReorderPagesPage";
import { RotatePagesPage } from "./RotatePagesPage";
import { SplitPdfPage } from "./SplitPdfPage";
import "./styles.css";

type SectionId =
  | "home"
  | "split"
  | "merge"
  | "reorder"
  | "rotate"
  | "delete"
  | "redact"
  | "privacy";

type AppSection = Readonly<{
  id: SectionId;
  label: string;
}>;

export const appSections: readonly AppSection[] = [
  { id: "home", label: "Home" },
  { id: "split", label: "Split PDF" },
  { id: "merge", label: "Merge PDF" },
  { id: "reorder", label: "Reorder Pages" },
  { id: "rotate", label: "Rotate Pages" },
  { id: "delete", label: "Delete Pages" },
  { id: "redact", label: "Redact PDF" },
  { id: "privacy", label: "Privacy" },
];

export function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const sectionTitle = useMemo(
    () => appSections.find((section) => section.id === activeSection)?.label,
    [activeSection],
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#home"
          onClick={() => setActiveSection("home")}
        >
          LocalDocs.org
        </a>
        <nav className="nav" aria-label="Main navigation">
          {appSections.map((section) => (
            <a
              aria-current={activeSection === section.id ? "page" : undefined}
              href={`#${section.id}`}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="hero" id="home">
        <div>
          <p className="eyebrow">Local-first document tools</p>
          <h1>PDF utilities that stay on your device.</h1>
          <p className="hero-copy">
            LocalDocs.org is a browser app for common PDF workflows. Merge PDF
            is available now, and the product direction is clear: your files
            should stay local in your browser by default.
          </p>
        </div>
        <PrivacyNote>
          No backend, no accounts, no analytics, no telemetry, and no server
          upload path in this app shell.
        </PrivacyNote>
      </div>

      <div className="current-section" aria-live="polite">
        Current section: {sectionTitle}
      </div>

      <Section id="split" title="Split PDF">
        <SplitPdfPage />
      </Section>

      <Section id="merge" title="Merge PDF">
        <MergePdfPage />
      </Section>

      <Section id="reorder" title="Reorder Pages">
        <ReorderPagesPage />
      </Section>

      <Section id="rotate" title="Rotate Pages">
        <RotatePagesPage />
      </Section>

      <Section id="delete" title="Delete Pages">
        <DeletePagesPage />
      </Section>

      <Section id="redact" title="Redact PDF">
        <PlaceholderPanel title="Redact PDF" status="Placeholder">
          Redaction is high risk and is intentionally not implemented. The shell
          makes no redaction claims.
        </PlaceholderPanel>
      </Section>

      <Section id="privacy" title="Privacy">
        <div className="privacy-grid">
          <PrivacyNote>Files stay local in the browser.</PrivacyNote>
          <PrivacyNote>
            No login, tracking, analytics, or telemetry.
          </PrivacyNote>
          <PrivacyNote>
            No server upload behavior exists in this first shell.
          </PrivacyNote>
        </div>
      </Section>
    </main>
  );
}
