import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MetadataRemovalPage } from "./MetadataRemovalPage";

describe("MetadataRemovalPage", () => {
  it("renders the default metadata removal workflow controls", () => {
    const markup = renderToStaticMarkup(<MetadataRemovalPage />);

    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("No PDF selected yet.");
    expect(markup).toContain("Remove Metadata");
    expect(markup).not.toContain("Redact");
    expect(markup).not.toContain("Edit Metadata");
  });
});
