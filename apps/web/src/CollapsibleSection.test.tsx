import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CollapsibleSection } from "./CollapsibleSection";

describe("CollapsibleSection", () => {
  it("uses a native disclosure with a useful summary", () => {
    const markup = renderToStaticMarkup(
      <CollapsibleSection
        isOpen
        onToggle={() => undefined}
        title="Page Order (2 Pages)"
      >
        <button type="button">Move up</button>
      </CollapsibleSection>,
    );

    expect(markup).toContain("<details");
    expect(markup).toContain('open=""');
    expect(markup).toContain("Page Order (2 Pages)");
    expect(markup).toContain("Move up");
  });
});
