import { expect, test } from "playwright/test";

test("LocalDocs web shell renders local-first placeholders", async ({
  page,
}) => {
  const externalRequests: string[] = [];

  page.on("request", (request) => {
    const requestUrl = new URL(request.url());

    if (requestUrl.origin !== "http://127.0.0.1:5173") {
      externalRequests.push(request.url());
    }
  });

  await page.goto("/");

  await expect(page.getByRole("link", { name: "LocalDocs.org" })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "PDF utilities that stay on your device.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Files stay local in the browser."),
  ).toBeVisible();

  await page.getByRole("link", { name: "Redact PDF" }).click();
  await expect(page.getByText("Current section: Redact PDF")).toBeVisible();
  await expect(page.getByText("Redaction is high risk")).toBeVisible();

  await expect(page.locator("input[type='file']")).toHaveCount(0);
  expect(externalRequests).toEqual([]);
});
