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

  await page.getByRole("link", { name: "Reorder Pages" }).click();
  await expect(page.getByText("Current section: Reorder Pages")).toBeVisible();

  const reorderFileInput = page.locator("#reorder-file-input");

  await reorderFileInput.setInputFiles({
    name: "wrong.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not a pdf"),
  });
  await expect(page.getByText("wrong.txt is not a PDF file.")).toBeVisible();

  await reorderFileInput.setInputFiles({
    name: "ordered.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(twoPagePdf),
  });

  await expect(
    page.locator("#reorder").getByText("ordered.pdf, 2 pages."),
  ).toBeVisible();
  await expect(
    page.locator("#reorder strong").getByText("Page 1"),
  ).toBeVisible();
  await expect(
    page.locator("#reorder strong").getByText("Page 2"),
  ).toBeVisible();

  const pageTwoRow = page.locator("#reorder .file-list__item").filter({
    hasText: "Page 2",
  });
  await pageTwoRow.getByRole("button", { name: "Move page 2 up" }).click();

  const reorderedPageNames = await page
    .locator("#reorder .file-list__item strong")
    .allTextContents();
  expect(reorderedPageNames).toEqual(["Page 2", "Page 1"]);

  await page.getByRole("button", { name: "Reorder Pages" }).click();
  await expect(
    page.getByRole("link", { name: "Download reordered PDF" }),
  ).toBeVisible();

  const reorderedPageOneRow = page.locator("#reorder .file-list__item").filter({
    hasText: "Page 1",
  });
  await reorderedPageOneRow
    .getByRole("button", { name: "Move page 1 up" })
    .click();
  await expect(
    page.getByRole("link", { name: "Download reordered PDF" }),
  ).toHaveCount(0);

  const reorderDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Reorder Pages" }).click();
  await page.getByRole("link", { name: "Download reordered PDF" }).click();
  const reorderDownload = await reorderDownloadPromise;
  const reorderDownloadPath = await reorderDownload.path();

  expect(reorderDownload.suggestedFilename()).toBe("ordered-reordered.pdf");
  expect(reorderDownloadPath).not.toBeNull();
  expect(
    (await readFile(reorderDownloadPath ?? "")).subarray(0, 5).toString(),
  ).toBe("%PDF-");

  await page.getByRole("link", { name: "Rotate Pages" }).click();
  await expect(page.getByText("Current section: Rotate Pages")).toBeVisible();

  const rotateFileInput = page.locator("#rotate-file-input");

  await rotateFileInput.setInputFiles({
    name: "rotatable.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(twoPagePdf),
  });

  await expect(
    page.locator("#rotate").getByText("rotatable.pdf, 2 pages."),
  ).toBeVisible();
  await expect(
    page.locator("#rotate").getByText("Rotation 0 degrees"),
  ).toHaveCount(2);

  const rotatePageOneRow = page.locator("#rotate .file-list__item").filter({
    hasText: "Page 1",
  });
  await rotatePageOneRow
    .getByRole("button", { name: "Rotate page 1 right" })
    .click();
  await expect(rotatePageOneRow.getByText("Rotation 90 degrees")).toBeVisible();

  await page.getByRole("button", { name: "Rotate Pages" }).click();
  await expect(
    page.getByRole("link", { name: "Download rotated PDF" }),
  ).toBeVisible();

  await rotatePageOneRow
    .getByRole("button", { name: "Rotate page 1 left" })
    .click();
  await expect(
    page.getByRole("link", { name: "Download rotated PDF" }),
  ).toHaveCount(0);

  const rotateDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Rotate Pages" }).click();
  await page.getByRole("link", { name: "Download rotated PDF" }).click();
  const rotateDownload = await rotateDownloadPromise;
  const rotateDownloadPath = await rotateDownload.path();

  expect(rotateDownload.suggestedFilename()).toBe("rotatable-rotated.pdf");
  expect(rotateDownloadPath).not.toBeNull();
  expect(
    (await readFile(rotateDownloadPath ?? "")).subarray(0, 5).toString(),
  ).toBe("%PDF-");

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
    .locator("#merge .file-list__item strong")
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
