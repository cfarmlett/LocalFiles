import { expect, test } from "playwright/test";
import { readFile } from "node:fs/promises";

const onePagePdf =
  "JVBERi0xLjcKJYGBgYEKCjUgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA0Ci9GaXJzdCAyMAovTGVuZ3RoIDI2Nwo+PgpzdHJlYW0KeJzVkslqwzAQhu96ijm2l2gsa3MxhtTLpRRC6KmhBxGLYChR8ALt23dkpS09lJ6L+NEy32j7JwMEAVJCDsaCBJULKEvGn94vHvjOnfzE+MPQT3CgKMIeXhivw3KeIWNVxb7Z2s3uNZxYSoIswp/Ebgz9cvQjlF3bdYgGEbUkaUTRUF+TCpKgOcWEpTHJyKtozeSI+ZZiXZI2KSfGV1Zd81vqidWRaRIrbZp/nRvPatMe4q/7FBXjj6Fv3OzhprkTKDTqTKOSVuLzLX3H6N0c/u/j1vsP4fzrC3/4HO2NJo8+1sDqMt/7KSzjkWwnror/5fvB3Yc3qhqkpgq1ERaszDa2oAoi5AOeoo8rCmVuZHN0cmVhbQplbmRvYmoKCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAyIDAgUgovSW5mbyAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDM0Ci9XIFsgMSAyIDIgXQovSW5kZXggWyAwIDcgXQo+PgpzdHJlYW0KeJwVxDEOACAIBLAext0v+3IIHYructmy1XbikXwGQ54CtQplbmRzdHJlYW0KZW5kb2JqCgpzdGFydHhyZWYKMzg1CiUlRU9G";
const twoPagePdf =
  "JVBERi0xLjcKJYGBgYEKCjYgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA1Ci9GaXJzdCAyNgovTGVuZ3RoIDI3Ngo+PgpzdHJlYW0KeJzVkk1LxDAQhu/5FXPUy2aSJmkipaD9uIiwLJ4UD2EbloJspB+g/97JZlU8iCcPEt6k6TyTr3cEIEjQCAVYBQp0YUGDEQ6qivH7t5cAfOsPYWb8dhxmeCQGYUdM6p8Yb+J6XECyumZfGY1f/HM8sJwKIsEfxHaKw7oPE1R91/eIJSIaRTKIsqWxITmSpDnFpKVvUqnOon9lgVhcU6zPMmXOSfETq8/5HY3EmsS0mVU2zz/3TXt1eQ3523lczfhdHFq/BLhoryRKg0YY1MoqfLik55iCX+L/vdzp/GM8/njDbz4ne5PJU6AayC7zXZjjOu3JduLq9F5hGP1NfKXaQWra6Y20VG1iYx1V0F8s+A644KZgCmVuZHN0cmVhbQplbmRvYmoKCjcgMCBvYmoKPDwKL1NpemUgOAovUm9vdCAyIDAgUgovSW5mbyAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDM2Ci9XIFsgMSAyIDIgXQovSW5kZXggWyAwIDggXQo+PgpzdHJlYW0KeJwVxLENACAMAzCnIGbu5umiejC6y2HKVNOadlySxwdPXALOCmVuZHN0cmVhbQplbmRvYmoKCnN0YXJ0eHJlZgozOTQKJSVFT0Y=";
const metadataPdf =
  "JVBERi0xLjcKJYGBgYEKCjUgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA0Ci9GaXJzdCAyMAovTGVuZ3RoIDI2Ngo+PgpzdHJlYW0KeJxlkdFqgzAUhu/zFOcJmhMTjYIIm9WbMhjd7sYuXBs6S2mGRra+/U6aqIwhP8Fz/v87JyoAIQGlQILOQYFICyhLxl9vXwb4c3cyI+O7/jjCG1kQ9vDOeG2nqwPBqoqt3rpz3cWeWAiB8Oa/Dt/w7cH49L3P92a003CgAPnIzZ/Mse8e7Q/NQ3rSIt0kOeRKbPKCZs/A3l0MlG3TtohKImZ0Zg0pIxUkRUpDTatYE6QaMUHKNCGjo09Lmv0wuU87LNg6YuUaVWqtaRlQ6YLwOMK8TB9nc3ALZxv7KnLiOb/fGUlcdxvXyuaZxNuZ27cd6BdEoKaATsKdZuN8Dw/L/i1e+e/2CwBucYUKZW5kc3RyZWFtCmVuZG9iagoKNiAwIG9iago8PAovU2l6ZSA3Ci9Sb290IDIgMCBSCi9JbmZvIDQgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9UeXBlIC9YUmVmCi9MZW5ndGggMzQKL1cgWyAxIDIgMiBdCi9JbmRleCBbIDAgNyBdCj4+CnN0cmVhbQp4nBXEMQ4AIAgEsB7G3Sf7cwgdiu5y2bLVduKRfAZDmwK0CmVuZHN0cmVhbQplbmRvYmoKCnN0YXJ0eHJlZgozODQKJSVFT0Y=";

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

  await page.getByRole("button", { name: "Split PDF", exact: true }).click();
  await expect(page.getByText("page-1.pdf")).toBeVisible();
  await expect(page.getByText("page-2.pdf")).toBeVisible();
  await expect(
    page.locator("#split").getByRole("heading", { name: "PDFs Generated" }),
  ).toBeVisible();

  const splitDownloadPromise = page.waitForEvent("download");
  await page
    .locator("#split")
    .getByLabel("Export result")
    .getByRole("link", { name: "Download page-1.pdf" })
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
  await page.getByRole("button", { name: "Split PDF", exact: true }).click();
  await expect(
    page.getByText("Enter a positive whole number of pages per file."),
  ).toBeVisible();
  await page
    .locator("#split")
    .getByRole("button", { name: "Clear Split PDF" })
    .click();
  await expect(
    page.locator("#split").getByText("No PDF selected yet."),
  ).toBeVisible();
  await expect(page.locator("#split").getByText("page-1.pdf")).toHaveCount(0);
  await expect(
    page
      .locator("#split")
      .getByText("Enter a positive whole number of pages per file."),
  ).toHaveCount(0);
  await expect(
    page.locator("#split").getByRole("radio", { name: "Every Page" }),
  ).toBeChecked();

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

  await page
    .getByRole("button", { name: "Reorder Pages", exact: true })
    .click();
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toBeVisible();

  const reorderedPageOneRow = page.locator("#reorder .file-list__item").filter({
    hasText: "Page 1",
  });
  await reorderedPageOneRow
    .getByRole("button", { name: "Move page 1 up" })
    .click();
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);

  const reorderDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Reorder Pages", exact: true })
    .click();
  await page
    .locator("#reorder")
    .getByRole("link", { name: "Download PDF" })
    .click();
  const reorderDownload = await reorderDownloadPromise;
  const reorderDownloadPath = await reorderDownload.path();

  expect(reorderDownload.suggestedFilename()).toBe("ordered-reordered.pdf");
  expect(reorderDownloadPath).not.toBeNull();
  expect(
    (await readFile(reorderDownloadPath ?? "")).subarray(0, 5).toString(),
  ).toBe("%PDF-");
  await page
    .locator("#reorder")
    .getByRole("button", { name: "Clear Reorder Pages" })
    .click();
  await expect(
    page.locator("#reorder").getByText("No PDF selected yet."),
  ).toBeVisible();
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await expect(page.locator("#reorder strong").getByText("Page 1")).toHaveCount(
    0,
  );

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

  await page.getByRole("button", { name: "Rotate Pages", exact: true }).click();
  await expect(
    page.locator("#rotate").getByRole("link", { name: "Download PDF" }),
  ).toBeVisible();

  await rotatePageOneRow
    .getByRole("button", { name: "Rotate page 1 left" })
    .click();
  await expect(
    page.locator("#rotate").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);

  const rotateDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Rotate Pages", exact: true }).click();
  await page
    .locator("#rotate")
    .getByRole("link", { name: "Download PDF" })
    .click();
  const rotateDownload = await rotateDownloadPromise;
  const rotateDownloadPath = await rotateDownload.path();

  expect(rotateDownload.suggestedFilename()).toBe("rotatable-rotated.pdf");
  expect(rotateDownloadPath).not.toBeNull();
  expect(
    (await readFile(rotateDownloadPath ?? "")).subarray(0, 5).toString(),
  ).toBe("%PDF-");
  await page
    .locator("#rotate")
    .getByRole("button", { name: "Clear Rotate Pages" })
    .click();
  await expect(
    page.locator("#rotate").getByText("No PDF selected yet."),
  ).toBeVisible();
  await expect(
    page.locator("#rotate").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#rotate").getByText("Rotation 0 degrees"),
  ).toHaveCount(0);

  await page.getByRole("link", { name: "Delete Pages" }).click();
  await expect(page.getByText("Current section: Delete Pages")).toBeVisible();

  const deleteFileInput = page.locator("#delete-file-input");

  await deleteFileInput.setInputFiles({
    name: "delete-source.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(twoPagePdf),
  });

  await expect(
    page.locator("#delete").getByText("delete-source.pdf, 2 pages."),
  ).toBeVisible();
  await expect(page.locator("#delete").getByText("Kept in output")).toHaveCount(
    2,
  );

  const deletePageOneRow = page.locator("#delete .file-list__item").filter({
    hasText: "Page 1",
  });
  const deletePageTwoRow = page.locator("#delete .file-list__item").filter({
    hasText: "Page 2",
  });

  await deletePageOneRow.getByRole("button", { name: "Delete page 1" }).click();
  await expect(deletePageOneRow.getByText("Marked for deletion")).toBeVisible();

  await deletePageTwoRow.getByRole("button", { name: "Delete page 2" }).click();
  await expect(
    page.getByText("Restore at least one page before generating a PDF."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete Pages", exact: true }),
  ).toBeDisabled();

  await deletePageTwoRow
    .getByRole("button", { name: "Restore page 2" })
    .click();

  const deleteDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Delete Pages", exact: true }).click();
  await page
    .locator("#delete")
    .getByRole("link", { name: "Download PDF" })
    .click();
  const deleteDownload = await deleteDownloadPromise;
  const deleteDownloadPath = await deleteDownload.path();

  expect(deleteDownload.suggestedFilename()).toBe(
    "delete-source-pages-deleted.pdf",
  );
  expect(deleteDownloadPath).not.toBeNull();
  expect(
    (await readFile(deleteDownloadPath ?? "")).subarray(0, 5).toString(),
  ).toBe("%PDF-");

  await deletePageOneRow
    .getByRole("button", { name: "Restore page 1" })
    .click();
  await expect(
    page.locator("#delete").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await page
    .locator("#delete")
    .getByRole("button", { name: "Clear Delete Pages" })
    .click();
  await expect(
    page.locator("#delete").getByText("No PDF selected yet."),
  ).toBeVisible();
  await expect(page.locator("#delete").getByText("Kept in output")).toHaveCount(
    0,
  );

  await page.getByRole("link", { name: "Remove Metadata" }).click();
  await expect(
    page.getByText("Current section: Remove Metadata"),
  ).toBeVisible();

  const metadataFileInput = page.locator("#metadata-file-input");

  await metadataFileInput.setInputFiles({
    name: "metadata-source.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(metadataPdf),
  });

  await expect(
    page.locator("#metadata").getByText("metadata-source.pdf, 1 page."),
  ).toBeVisible();
  await expect(page.locator("#metadata").getByText("Title")).toBeVisible();
  await expect(
    page.locator("#metadata").getByText("Confidential Notes"),
  ).toBeVisible();
  await expect(page.locator("#metadata").getByText("Author")).toBeVisible();
  await expect(
    page.locator("#metadata").getByText("LocalDocs Test"),
  ).toBeVisible();

  const metadataDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Remove Metadata", exact: true })
    .click();
  await page
    .locator("#metadata")
    .getByRole("link", { name: "Download PDF" })
    .click();
  const metadataDownload = await metadataDownloadPromise;
  const metadataDownloadPath = await metadataDownload.path();

  expect(metadataDownload.suggestedFilename()).toBe(
    "metadata-source-metadata-removed.pdf",
  );
  expect(metadataDownloadPath).not.toBeNull();
  expect(
    (await readFile(metadataDownloadPath ?? "")).subarray(0, 5).toString(),
  ).toBe("%PDF-");

  await metadataFileInput.setInputFiles({
    name: "metadata-empty.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(onePagePdf),
  });
  await expect(
    page.locator("#metadata").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await page
    .locator("#metadata")
    .getByRole("button", { name: "Clear Remove Metadata" })
    .click();
  await expect(
    page.locator("#metadata").getByText("No PDF selected yet."),
  ).toBeVisible();
  await expect(page.locator("#metadata").getByText("Title")).toHaveCount(0);

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
    page.locator("#merge").getByRole("link", { name: "Download PDF" }),
  ).toBeVisible();

  await fileInput.setInputFiles({
    name: "not-a-pdf.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not a pdf"),
  });
  await expect(
    page.getByText("not-a-pdf.txt is not a PDF file."),
  ).toBeVisible();
  await expect(
    page.locator("#merge").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);

  const firstRow = page.locator(".file-list__item").filter({
    hasText: "second.pdf",
  });
  await firstRow.getByRole("button", { name: "Move second.pdf down" }).click();
  await expect(
    page.locator("#merge").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Merge PDFs" }).click();
  await page
    .locator("#merge")
    .getByRole("link", { name: "Download PDF" })
    .click();
  const download = await downloadPromise;
  const downloadPath = await download.path();

  expect(download.suggestedFilename()).toBe("localdocs-merged.pdf");
  expect(downloadPath).not.toBeNull();

  const downloadedBytes = await readFile(downloadPath ?? "");

  expect(downloadedBytes.byteLength).toBeGreaterThan(0);
  expect(downloadedBytes.subarray(0, 5).toString()).toBe("%PDF-");
  await page
    .locator("#merge")
    .getByRole("button", { name: "Clear Merge PDF" })
    .click();
  await expect(
    page.locator("#merge").getByText("No PDFs selected yet."),
  ).toBeVisible();
  await expect(page.locator("#merge").getByText("first.pdf")).toHaveCount(0);
  await expect(
    page.locator("#merge").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#merge").getByText("not-a-pdf.txt is not a PDF file."),
  ).toHaveCount(0);

  expect(externalRequests).toEqual([]);
});
