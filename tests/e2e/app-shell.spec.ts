import { expect, test } from "playwright/test";
import { readFile } from "node:fs/promises";

const onePagePdf =
  "JVBERi0xLjcKJYGBgYEKCjUgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA0Ci9GaXJzdCAyMAovTGVuZ3RoIDI2Nwo+PgpzdHJlYW0KeJzVkslqwzAQhu96ijm2l2gsa3MxhtTLpRRC6KmhBxGLYChR8ALt23dkpS09lJ6L+NEy32j7JwMEAVJCDsaCBJULKEvGn94vHvjOnfzE+MPQT3CgKMIeXhivw3KeIWNVxb7Z2s3uNZxYSoIswp/Ebgz9cvQjlF3bdYgGEbUkaUTRUF+TCpKgOcWEpTHJyKtozeSI+ZZiXZI2KSfGV1Zd81vqidWRaRIrbZp/nRvPatMe4q/7FBXjj6Fv3OzhprkTKDTqTKOSVuLzLX3H6N0c/u/j1vsP4fzrC3/4HO2NJo8+1sDqMt/7KSzjkWwnror/5fvB3Yc3qhqkpgq1ERaszDa2oAoi5AOeoo8rCmVuZHN0cmVhbQplbmRvYmoKCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAyIDAgUgovSW5mbyAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDM0Ci9XIFsgMSAyIDIgXQovSW5kZXggWyAwIDcgXQo+PgpzdHJlYW0KeJwVxDEOACAIBLAext0v+3IIHYructmy1XbikXwGQ54CtQplbmRzdHJlYW0KZW5kb2JqCgpzdGFydHhyZWYKMzg1CiUlRU9G";
const twoPagePdf =
  "JVBERi0xLjcKJYGBgYEKCjYgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA1Ci9GaXJzdCAyNgovTGVuZ3RoIDI3Ngo+PgpzdHJlYW0KeJzVkk1LxDAQhu/5FXPUy2aSJmkipaD9uIiwLJ4UD2EbloJspB+g/97JZlU8iCcPEt6k6TyTr3cEIEjQCAVYBQp0YUGDEQ6qivH7t5cAfOsPYWb8dhxmeCQGYUdM6p8Yb+J6XECyumZfGY1f/HM8sJwKIsEfxHaKw7oPE1R91/eIJSIaRTKIsqWxITmSpDnFpKVvUqnOon9lgVhcU6zPMmXOSfETq8/5HY3EmsS0mVU2zz/3TXt1eQ3523lczfhdHFq/BLhoryRKg0YY1MoqfLik55iCX+L/vdzp/GM8/njDbz4ne5PJU6AayC7zXZjjOu3JduLq9F5hGP1NfKXaQWra6Y20VG1iYx1V0F8s+A644KZgCmVuZHN0cmVhbQplbmRvYmoKCjcgMCBvYmoKPDwKL1NpemUgOAovUm9vdCAyIDAgUgovSW5mbyAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDM2Ci9XIFsgMSAyIDIgXQovSW5kZXggWyAwIDggXQo+PgpzdHJlYW0KeJwVxLENACAMAzCnIGbu5umiejC6y2HKVNOadlySxwdPXALOCmVuZHN0cmVhbQplbmRvYmoKCnN0YXJ0eHJlZgozOTQKJSVFT0Y=";

function pdfBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

test("LocalDocs web shell supports local-first PDF workflows", async ({
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

  await page.getByRole("link", { name: "Split PDF" }).click();
  await expect(page.getByText("Current section: Split PDF")).toBeVisible();

  const splitFileInput = page.locator("#split-file-input");

  await splitFileInput.setInputFiles({
    name: "split-source.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(twoPagePdf),
  });

  await expect(page.getByText("split-source.pdf, 2 pages.")).toBeVisible();

  await page.getByRole("button", { name: "Split PDF" }).click();
  await expect(page.getByText("page-1.pdf")).toBeVisible();
  await expect(page.getByText("page-2.pdf")).toBeVisible();

  const splitDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("list", { name: "Generated split PDFs" })
    .getByRole("link", { name: "Download" })
    .first()
    .click();
  const splitDownload = await splitDownloadPromise;
  const splitDownloadPath = await splitDownload.path();

  expect(splitDownload.suggestedFilename()).toBe("page-1.pdf");
  expect(splitDownloadPath).not.toBeNull();
  expect(
    (await readFile(splitDownloadPath ?? "")).subarray(0, 5).toString(),
  ).toBe("%PDF-");

  await page.getByRole("radio", { name: "Every N Pages" }).check();
  await expect(page.getByText("page-1.pdf")).toHaveCount(0);
  await page.getByLabel("Pages per file").fill("0");
  await page.getByRole("button", { name: "Split PDF" }).click();
  await expect(
    page.getByText("Enter a positive whole number of pages per file."),
  ).toBeVisible();

  await page.getByRole("link", { name: "Merge PDF" }).click();
  await expect(page.getByText("Current section: Merge PDF")).toBeVisible();

  const fileInput = page.locator("#merge-file-input");

  await fileInput.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not a pdf"),
  });
  await expect(page.getByText("notes.txt is not a PDF file.")).toBeVisible();

  await fileInput.setInputFiles([
    {
      name: "first.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer(onePagePdf),
    },
    {
      name: "second.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer(twoPagePdf),
    },
  ]);

  await expect(page.getByText("first.pdf")).toBeVisible();
  await expect(page.getByText("second.pdf")).toBeVisible();
  await expect(page.getByText("2 PDFs selected, 3 total pages.")).toBeVisible();

  const secondRow = page.locator(".file-list__item").filter({
    hasText: "second.pdf",
  });
  await secondRow.getByRole("button", { name: "Move second.pdf up" }).click();

  const fileNames = await page
    .locator(".file-list__item strong")
    .allTextContents();
  expect(fileNames).toEqual(["second.pdf", "first.pdf"]);

  await page.getByRole("button", { name: "Merge PDFs" }).click();
  await expect(
    page.getByRole("link", { name: "Download merged PDF" }),
  ).toBeVisible();

  const firstRow = page.locator(".file-list__item").filter({
    hasText: "second.pdf",
  });
  await firstRow.getByRole("button", { name: "Move second.pdf down" }).click();
  await expect(
    page.getByRole("link", { name: "Download merged PDF" }),
  ).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Merge PDFs" }).click();
  await page.getByRole("link", { name: "Download merged PDF" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();

  expect(download.suggestedFilename()).toBe("localdocs-merged.pdf");
  expect(downloadPath).not.toBeNull();

  const downloadedBytes = await readFile(downloadPath ?? "");

  expect(downloadedBytes.byteLength).toBeGreaterThan(0);
  expect(downloadedBytes.subarray(0, 5).toString()).toBe("%PDF-");

  expect(externalRequests).toEqual([]);
});
