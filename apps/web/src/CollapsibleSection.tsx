import type { ReactNode } from "react";

export type CollapsibleSectionProps = Readonly<{
  children: ReactNode;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  title: string;
}>;

export function CollapsibleSection({
  children,
  isOpen,
  onToggle,
  title,
}: CollapsibleSectionProps) {
  return (
    <details
      className="collapsible-section"
      onToggle={(event) => onToggle(event.currentTarget.open)}
      open={isOpen}
    >
      <summary className="collapsible-section__summary">{title}</summary>
      <div className="collapsible-section__content">{children}</div>
    </details>
  );
}
