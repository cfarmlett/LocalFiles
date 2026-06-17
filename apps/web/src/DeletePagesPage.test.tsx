import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DeletePagesPage } from "./DeletePagesPage";

describe("DeletePagesPage", () => {
  it("renders the default delete workflow controls", () => {
    const markup = renderToStaticMarkup(<DeletePagesPage />);

    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("No PDF selected yet.");
    expect(markup).toContain("Delete Pages");
    expect(markup).not.toContain("Select all");
    expect(markup).not.toContain("Extract");
  });
});
