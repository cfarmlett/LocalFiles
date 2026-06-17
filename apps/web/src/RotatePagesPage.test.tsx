import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RotatePagesPage } from "./RotatePagesPage";

describe("RotatePagesPage", () => {
  it("renders the default rotate workflow controls", () => {
    const markup = renderToStaticMarkup(<RotatePagesPage />);

    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("No PDF selected yet.");
    expect(markup).toContain("Rotate Pages");
    expect(markup).not.toContain("Rotate All");
    expect(markup).not.toContain("Delete");
  });
});
