import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { PlaceholderPanel, PrivacyNote, Section } from "@localfiles/ui";

import { DeletePagesPage } from "./DeletePagesPage";
import { MergePdfPage } from "./MergePdfPage";
import { MetadataRemovalPage } from "./MetadataRemovalPage";
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
  | "metadata"
  | "redact"
  | "privacy";

type AppSection = Readonly<{
  id: SectionId;
  label: string;
}>;

export const toolSections: readonly AppSection[] = [
  { id: "split", label: "Split PDF" },
  { id: "merge", label: "Merge PDF" },
  { id: "reorder", label: "Reorder Pages" },
  { id: "rotate", label: "Rotate Pages" },
  { id: "delete", label: "Delete Pages" },
  { id: "metadata", label: "Remove Metadata" },
];

export const appSections: readonly AppSection[] = [
  { id: "home", label: "Home" },
  ...toolSections,
  { id: "redact", label: "Redact PDF" },
  { id: "privacy", label: "Privacy" },
];

function getSectionIdFromHash(): SectionId {
  return getHashDestination() ?? "home";
}

function getHashDestination(): SectionId | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const hashSectionId = window.location.hash.slice(1);

  return appSections.some((section) => section.id === hashSectionId)
    ? (hashSectionId as SectionId)
    : undefined;
}

export function App() {
  const [activeSection, setActiveSection] =
    useState<SectionId>(getSectionIdFromHash);
  const sectionTitle = useMemo(
    () => appSections.find((section) => section.id === activeSection)?.label,
    [activeSection],
  );

  useLayoutEffect(() => {
    const hashDestination = getHashDestination();

    if (hashDestination !== undefined) {
      document.getElementById(hashDestination)?.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    function syncActiveSectionFromHash() {
      setActiveSection(getSectionIdFromHash());
    }

    window.addEventListener("hashchange", syncActiveSectionFromHash);

    return () => {
      window.removeEventListener("hashchange", syncActiveSectionFromHash);
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="topbar__identity">
            <a
              aria-current={activeSection === "home" ? "page" : undefined}
              className="brand"
              href="#home"
              onClick={() => setActiveSection("home")}
            >
              LocalFiles.org
            </a>
            <a
              aria-current={activeSection === "privacy" ? "page" : undefined}
              className="header-utility"
              href="#privacy"
              onClick={() => setActiveSection("privacy")}
            >
              Privacy
            </a>
          </div>
          <nav className="nav" aria-label="PDF tools">
            {toolSections.map((section) => (
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
        </div>
      </header>

      <div className="hero" id="home">
        <div>
          <p className="eyebrow">Local-first document tools</p>
          <h1>PDF utilities that stay on your device.</h1>
          <p className="hero-copy">
            LocalFiles.org is a browser app for common PDF workflows: Merge PDF,
            Split PDF, Reorder Pages, Rotate Pages, Delete Pages, and Remove
            Metadata. Files are processed locally in your browser.
          </p>
        </div>
        <PrivacyNote>
          Your PDFs are not uploaded to a LocalFiles server. No account is
          required.
        </PrivacyNote>
      </div>

      <div className="current-section visually-hidden" aria-live="polite">
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

      <Section id="metadata" title="Remove Metadata">
        <MetadataRemovalPage />
      </Section>

      <Section id="redact" title="Redact PDF">
        <PlaceholderPanel title="Redact PDF" status="Unavailable">
          Redaction is not available. It is intentionally withheld because
          visually hiding content without safely removing the underlying PDF
          data would be misleading. Read the{" "}
          <a
            className="limitation-link"
            href="https://github.com/cfarmlett/LocalFiles/blob/main/docs/investigations/redaction.md"
          >
            redaction investigation
          </a>
          .
        </PlaceholderPanel>
      </Section>

      <Section id="privacy" title="Privacy">
        <div className="privacy-grid">
          <PrivacyNote>
            Files are processed locally in your browser.
          </PrivacyNote>
          <PrivacyNote>
            No account, tracking, analytics, or telemetry.
          </PrivacyNote>
          <PrivacyNote>
            PDFs are not uploaded to a LocalFiles server.
          </PrivacyNote>
        </div>
        <nav className="trust-links" aria-label="Trust and project resources">
          <span>Verify how LocalFiles works:</span>
          <a href="https://github.com/cfarmlett/LocalFiles">Source code</a>
          <a href="https://github.com/cfarmlett/LocalFiles/blob/main/LICENSE">
            Apache 2.0 license
          </a>
          <a href="https://github.com/cfarmlett/LocalFiles/blob/main/PRIVACY.md">
            Privacy details
          </a>
          <a href="https://github.com/cfarmlett/LocalFiles/blob/main/SECURITY.md">
            Security policy
          </a>
        </nav>
      </Section>
    </main>
  );
}
