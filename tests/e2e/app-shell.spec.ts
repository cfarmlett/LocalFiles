import { expect, test, type Locator, type Page } from "playwright/test";
import { readFile } from "node:fs/promises";

const onePagePdf =
  "JVBERi0xLjcKJYGBgYEKCjUgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA0Ci9GaXJzdCAyMAovTGVuZ3RoIDI2Nwo+PgpzdHJlYW0KeJzVkslqwzAQhu96ijm2l2gsa3MxhtTLpRRC6KmhBxGLYChR8ALt23dkpS09lJ6L+NEy32j7JwMEAVJCDsaCBJULKEvGn94vHvjOnfzE+MPQT3CgKMIeXhivw3KeIWNVxb7Z2s3uNZxYSoIswp/Ebgz9cvQjlF3bdYgGEbUkaUTRUF+TCpKgOcWEpTHJyKtozeSI+ZZiXZI2KSfGV1Zd81vqidWRaRIrbZp/nRvPatMe4q/7FBXjj6Fv3OzhprkTKDTqTKOSVuLzLX3H6N0c/u/j1vsP4fzrC3/4HO2NJo8+1sDqMt/7KSzjkWwnror/5fvB3Yc3qhqkpgq1ERaszDa2oAoi5AOeoo8rCmVuZHN0cmVhbQplbmRvYmoKCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAyIDAgUgovSW5mbyAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDM0Ci9XIFsgMSAyIDIgXQovSW5kZXggWyAwIDcgXQo+PgpzdHJlYW0KeJwVxDEOACAIBLAext0v+3IIHYructmy1XbikXwGQ54CtQplbmRzdHJlYW0KZW5kb2JqCgpzdGFydHhyZWYKMzg1CiUlRU9G";
const noMetadataPdf =
  "JVBERi0xLjcKJYGBgYEKCjQgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiAzCi9GaXJzdCAxNAovTGVuZ3RoIDEzNQo+PgpzdHJlYW0KeJxVjUEKwjAQRfdzin+CTlJTTKF0YZciSHEnLoIdSkGMNC3o7Z3oQuQv33t8C4MSzmGDrUfTEJ9eDwEfwyiJeD8NCWeFBj0uxF1c7wsstS393C4s4RZH+kawWf43Msh4llx/OPeS4jpfNVBPbT7IMIVdfOqf0VV1VZQe3tnC1/qtyhv2yCwVCmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKPDwKL1NpemUgNgovUm9vdCAyIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDI5Ci9XIFsgMSAxIDIgXQovSW5kZXggWyAwIDYgXQo+PgpzdHJlYW0KeJxjYPj/n4mFgQGIGYGYiVGAgYHxLwMDAC+TAyMKZW5kc3RyZWFtCmVuZG9iagoKc3RhcnR4cmVmCjI1MwolJUVPRg==";
const twoPagePdf =
  "JVBERi0xLjcKJYGBgYEKCjYgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA1Ci9GaXJzdCAyNgovTGVuZ3RoIDI3Ngo+PgpzdHJlYW0KeJzVkk1LxDAQhu/5FXPUy2aSJmkipaD9uIiwLJ4UD2EbloJspB+g/97JZlU8iCcPEt6k6TyTr3cEIEjQCAVYBQp0YUGDEQ6qivH7t5cAfOsPYWb8dhxmeCQGYUdM6p8Yb+J6XECyumZfGY1f/HM8sJwKIsEfxHaKw7oPE1R91/eIJSIaRTKIsqWxITmSpDnFpKVvUqnOon9lgVhcU6zPMmXOSfETq8/5HY3EmsS0mVU2zz/3TXt1eQ3523lczfhdHFq/BLhoryRKg0YY1MoqfLik55iCX+L/vdzp/GM8/njDbz4ne5PJU6AayC7zXZjjOu3JduLq9F5hGP1NfKXaQWra6Y20VG1iYx1V0F8s+A644KZgCmVuZHN0cmVhbQplbmRvYmoKCjcgMCBvYmoKPDwKL1NpemUgOAovUm9vdCAyIDAgUgovSW5mbyAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDM2Ci9XIFsgMSAyIDIgXQovSW5kZXggWyAwIDggXQo+PgpzdHJlYW0KeJwVxLENACAMAzCnIGbu5umiejC6y2HKVNOadlySxwdPXALOCmVuZHN0cmVhbQplbmRvYmoKCnN0YXJ0eHJlZgozOTQKJSVFT0Y=";
const threePagePdf =
  "JVBERi0xLjcKJYGBgYEKCjcgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA2Ci9GaXJzdCAzMgovTGVuZ3RoIDI3OQo+PgpzdHJlYW0KeJzVUk1rxCAQvfsr5the1tEYoyUEtvm4lMKy9NTSg2xkCSxryQe0/75j3Lb0UHpe5DnqvJlR3whAkJBryMAiKMgVAbQkQIEaypLxp483D3znjn5i/GHoJ3ghJsKemHHW6/zKeB2W8wwZqyr2E1e72Z3CkaUEICL5i7EbQ78c/Ahl13YdYoGIWhE0omzI1gRLkLQnnzS0JhTqAjorMsRsS74uQRcpJvpXbn6Jb8kSV0dOk7jKpP133VirTTnkf/exFeOPoW/c7OGmuZMoNWphUAor8PmWvmP0bg7X+7j1/kM4//nCXzpHeaPIo6ceSCrzvZ/CMh5IduJV8b98P7j78E4dhDRym2+kAaPExljqoKtI+AnYYb2FCmVuZHN0cmVhbQplbmRvYmoKCjggMCBvYmoKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyAzIDAgUgovRmlsdGVyIC9GbGF0ZURlY29kZQovVHlwZSAvWFJlZgovTGVuZ3RoIDM4Ci9XIFsgMSAyIDIgXQovSW5kZXggWyAwIDkgXQo+PgpzdHJlYW0KeJwVxDEOACAMxLBcAbH247y5KB4MzBQXLFa2bNsJDcmDD1uWAuQKZW5kc3RyZWFtCmVuZG9iagoKc3RhcnR4cmVmCjM5NwolJUVPRg==";
const metadataPdf =
  "JVBERi0xLjcKJYGBgYEKCjUgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA0Ci9GaXJzdCAyMAovTGVuZ3RoIDM2Nwo+PgpzdHJlYW0KeJzVkk1PwzAMhu/9FT7CZU1Tt2nRNGn04zIhTYMTiENZo1E0LahrBfv3OI3DQAjuqLLSxO/72FYSgQAJiBCDygAhSnKYz4Pw7vSqIVw3O30MwlXXHuGBJAI28BiEhRkPA0TBYhGctUUzNHuzC5wJIiv+rrAJm+61dU/5cKOPZuy3ZCAdqcMb3XbNtXmneoK+JE9mMoMMo1mWU20P7Ia9hnld1bUQGAuR0ppWFClFToEUiTtTyGcRRSGEFOSpnEexTsVUezkOz6b/xBaMjc9W9PjC2xwuwfNeIaFux6cXvR0+WSXnkVm8+v3EkNxyya2lvi7xVvr0Znq6BgYqMijpmvFCP4uFpT+aJ8i6N+241f1XyNQJAWTJJjuddBCZ0X/mwFMIN2G8pFztIlXcBLI2YX/FxWs3kdVixpP5ujlfmnL5P/vJ7eMwbdkMGi7KKylkSpPlVBATvL+kV9nrZjD/d7ip/84cfp2Q3v4HNsTTYgplbmRzdHJlYW0KZW5kb2JqCgo2IDAgb2JqCjw8Ci9TaXplIDcKL1Jvb3QgMiAwIFIKL0luZm8gNCAwIFIKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL1R5cGUgL1hSZWYKL0xlbmd0aCAzNQovVyBbIDEgMiAyIF0KL0luZGV4IFsgMCA3IF0KPj4Kc3RyZWFtCnicFcSxEQAgCASwPJ69++/nHHCkCLrLZctW24lH8hlEygMZCmVuZHN0cmVhbQplbmRvYmoKCnN0YXJ0eHJlZgo0ODUKJSVFT0Y=";

function pdfBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

function reorderRow(page: Page, pageName: string): Locator {
  return page
    .locator("#reorder .file-list__item")
    .filter({ hasText: pageName });
}

function dragHandle(page: Page, pageName: string): Locator {
  return reorderRow(page, pageName).locator(".drag-handle");
}

async function reorderPageNames(page: Page): Promise<string[]> {
  return page.locator("#reorder .file-list__item strong").allTextContents();
}

async function dragPageBefore(
  sourceHandle: Locator,
  targetRow: Locator,
): Promise<void> {
  const targetElement = await targetRow.elementHandle();

  expect(targetElement).not.toBeNull();

  await sourceHandle.evaluate((sourceElement, dropTarget) => {
    if (dropTarget === null) {
      throw new Error("Drop target was not available.");
    }

    const dataTransfer = new DataTransfer();
    const dragOptions = {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    };

    sourceElement.dispatchEvent(new DragEvent("dragstart", dragOptions));
    dropTarget.dispatchEvent(new DragEvent("dragenter", dragOptions));
    dropTarget.dispatchEvent(new DragEvent("dragover", dragOptions));
    dropTarget.dispatchEvent(new DragEvent("drop", dragOptions));
    sourceElement.dispatchEvent(new DragEvent("dragend", dragOptions));
  }, targetElement);
}

async function dropPageDragOnReorderDropZone(
  sourceHandle: Locator,
  page: Page,
): Promise<void> {
  const dropZoneElement = await page
    .locator("#reorder .drop-zone")
    .elementHandle();

  expect(dropZoneElement).not.toBeNull();

  await sourceHandle.evaluate((sourceElement, dropTarget) => {
    if (dropTarget === null) {
      throw new Error("Drop zone was not available.");
    }

    const dataTransfer = new DataTransfer();
    const dragOptions = {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    };

    sourceElement.dispatchEvent(new DragEvent("dragstart", dragOptions));
    dropTarget.dispatchEvent(new DragEvent("dragover", dragOptions));
    dropTarget.dispatchEvent(new DragEvent("drop", dragOptions));
    sourceElement.dispatchEvent(new DragEvent("dragend", dragOptions));
  }, dropZoneElement);
}

async function cancelDrag(sourceHandle: Locator): Promise<void> {
  await sourceHandle.evaluate((sourceElement) => {
    const dataTransfer = new DataTransfer();
    const dragOptions = {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    };

    sourceElement.dispatchEvent(new DragEvent("dragstart", dragOptions));
    sourceElement.dispatchEvent(new DragEvent("dragend", dragOptions));
  });
}

async function dropPdfOnReorderDropZone(
  page: Page,
  name: string,
  base64: string,
): Promise<void> {
  await page.locator("#reorder .drop-zone").evaluate(
    (dropZone, fileData) => {
      const bytes = Uint8Array.from(atob(fileData.base64), (character) =>
        character.charCodeAt(0),
      );
      const file = new File([bytes], fileData.name, {
        type: "application/pdf",
      });
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(file);

      const dragOptions = {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      };

      dropZone.dispatchEvent(new DragEvent("dragover", dragOptions));
      dropZone.dispatchEvent(new DragEvent("drop", dragOptions));
    },
    { base64, name },
  );
}

async function mountDeferredSplitHarness(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const reactModulePath = "/node_modules/.vite/deps/react.js";
    const reactDomModulePath = "/node_modules/.vite/deps/react-dom_client.js";
    const splitPdfModulePath = "/src/SplitPdfPage.tsx";
    const [reactModule, reactDomModule, { SplitPdfPage }] = await Promise.all([
      import(reactModulePath),
      import(reactDomModulePath),
      import(splitPdfModulePath),
    ]);
    const createElement =
      reactModule.createElement ?? reactModule.default.createElement;
    const createRoot =
      reactDomModule.createRoot ?? reactDomModule.default.createRoot;
    const splitWindow = window as typeof window & {
      __localFilesResolveSplit?: (requestIndex: number) => void;
      __localFilesSplitCompletions?: number;
      __localFilesSplitRequests?: number;
    };
    const pendingSplits: Array<(() => void) | undefined> = [];
    const adapter = {
      name: "deferred-split-test-adapter",
      readMetadata: async () => ({ pageCount: 2 }),
      split: async (request: {
        ranges: readonly Readonly<{ start: number; end: number }>[];
      }) => {
        const requestIndex = splitWindow.__localFilesSplitRequests ?? 0;

        splitWindow.__localFilesSplitRequests = requestIndex + 1;

        const outputs = await new Promise<readonly Uint8Array[]>((resolve) => {
          pendingSplits[requestIndex] = () => {
            resolve(
              request.ranges.map(
                (range) => new Uint8Array([range.start, range.end]),
              ),
            );
          };
        });

        splitWindow.__localFilesSplitCompletions =
          (splitWindow.__localFilesSplitCompletions ?? 0) + 1;

        return outputs;
      },
    };
    const harnessRoot = document.createElement("div");

    splitWindow.__localFilesSplitRequests = 0;
    splitWindow.__localFilesSplitCompletions = 0;
    splitWindow.__localFilesResolveSplit = (requestIndex) => {
      const resolve = pendingSplits[requestIndex];

      if (resolve === undefined) {
        throw new Error(`Deferred split ${requestIndex} was not available.`);
      }

      pendingSplits[requestIndex] = undefined;
      resolve();
    };
    document.body.replaceChildren(harnessRoot);
    createRoot(harnessRoot).render(createElement(SplitPdfPage, { adapter }));
  });

  await expect(page.getByText("No PDF selected yet.")).toBeVisible();
}

async function resolveDeferredSplit(
  page: Page,
  requestIndex: number,
  expectedCompletionCount: number,
): Promise<void> {
  await page.evaluate((index) => {
    const splitWindow = window as typeof window & {
      __localFilesResolveSplit?: (requestIndex: number) => void;
    };

    splitWindow.__localFilesResolveSplit?.(index);
  }, requestIndex);
  await page.waitForFunction((completionCount) => {
    const splitWindow = window as typeof window & {
      __localFilesSplitCompletions?: number;
    };

    return splitWindow.__localFilesSplitCompletions === completionCount;
  }, expectedCompletionCount);
}

async function deferZipTimer(page: Page): Promise<void> {
  await page.evaluate(() => {
    const zipWindow = window as typeof window & {
      __localFilesNativeSetTimeout?: typeof window.setTimeout;
      __localFilesZipTimeouts?: Array<() => void>;
    };

    zipWindow.__localFilesNativeSetTimeout = window.setTimeout.bind(window);
    zipWindow.__localFilesZipTimeouts = [];
    window.setTimeout = ((handler: TimerHandler, timeout?: number) => {
      if (timeout === 0) {
        zipWindow.__localFilesZipTimeouts?.push(() => {
          if (typeof handler === "function") {
            handler();
          }
        });

        return 0;
      }

      return zipWindow.__localFilesNativeSetTimeout?.(handler, timeout) ?? 0;
    }) as typeof window.setTimeout;
  });
}

async function flushZipTimer(page: Page): Promise<void> {
  await page.evaluate(() => {
    const zipWindow = window as typeof window & {
      __localFilesNativeSetTimeout?: typeof window.setTimeout;
      __localFilesZipTimeouts?: Array<() => void>;
    };
    const pendingTimers = zipWindow.__localFilesZipTimeouts ?? [];

    zipWindow.__localFilesZipTimeouts = [];
    pendingTimers.forEach((callback) => callback());

    if (zipWindow.__localFilesNativeSetTimeout !== undefined) {
      window.setTimeout = zipWindow.__localFilesNativeSetTimeout;
      delete zipWindow.__localFilesNativeSetTimeout;
    }
  });
}

async function expectNoStaleZipDownload(
  page: Page,
  invalidateZip: () => Promise<void>,
): Promise<void> {
  let downloadCount = 0;

  page.on("download", () => {
    downloadCount += 1;
  });

  await deferZipTimer(page);
  await page
    .locator("#split")
    .getByRole("button", { name: "Download ZIP" })
    .click();
  await expect(
    page.locator("#split").getByRole("button", { name: "Preparing ZIP..." }),
  ).toBeVisible();
  await invalidateZip();
  await flushZipTimer(page);
  await page.waitForTimeout(50);

  expect(downloadCount).toBe(0);
  await expect(page.locator("#split").getByText("ZIP export")).toHaveCount(0);
}

async function expectZipUrlRevokedAfterLateInvalidation(
  page: Page,
): Promise<void> {
  let downloadCount = 0;

  page.on("download", () => {
    downloadCount += 1;
  });

  await page.evaluate(() => {
    const zipWindow = window as typeof window & {
      __localFilesNativeCreateObjectUrl?: typeof URL.createObjectURL;
      __localFilesNativeRevokeObjectUrl?: typeof URL.revokeObjectURL;
      __localFilesRevokedUrls?: string[];
    };

    zipWindow.__localFilesNativeCreateObjectUrl = URL.createObjectURL.bind(URL);
    zipWindow.__localFilesNativeRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
    zipWindow.__localFilesRevokedUrls = [];

    URL.createObjectURL = ((object: Blob | MediaSource) => {
      if (object instanceof Blob && object.type === "application/zip") {
        document
          .querySelector<HTMLButtonElement>(
            '#split button[aria-label="Clear Split PDF"]',
          )
          ?.click();

        return "blob:stale-split-zip";
      }

      return zipWindow.__localFilesNativeCreateObjectUrl?.(object) ?? "";
    }) as typeof URL.createObjectURL;

    URL.revokeObjectURL = ((url: string) => {
      zipWindow.__localFilesRevokedUrls?.push(url);

      if (url !== "blob:stale-split-zip") {
        zipWindow.__localFilesNativeRevokeObjectUrl?.(url);
      }
    }) as typeof URL.revokeObjectURL;
  });

  await page
    .locator("#split")
    .getByRole("button", { name: "Download ZIP" })
    .click();
  await expect(
    page.locator("#split").getByText("No PDF selected yet."),
  ).toBeVisible();
  await page.waitForTimeout(50);

  const revokedUrls = await page.evaluate(() => {
    const zipWindow = window as typeof window & {
      __localFilesNativeCreateObjectUrl?: typeof URL.createObjectURL;
      __localFilesNativeRevokeObjectUrl?: typeof URL.revokeObjectURL;
      __localFilesRevokedUrls?: string[];
    };
    const urls = zipWindow.__localFilesRevokedUrls ?? [];

    if (zipWindow.__localFilesNativeCreateObjectUrl !== undefined) {
      URL.createObjectURL = zipWindow.__localFilesNativeCreateObjectUrl;
      delete zipWindow.__localFilesNativeCreateObjectUrl;
    }

    if (zipWindow.__localFilesNativeRevokeObjectUrl !== undefined) {
      URL.revokeObjectURL = zipWindow.__localFilesNativeRevokeObjectUrl;
      delete zipWindow.__localFilesNativeRevokeObjectUrl;
    }

    delete zipWindow.__localFilesRevokedUrls;

    return urls;
  });

  expect(downloadCount).toBe(0);
  expect(revokedUrls).toContain("blob:stale-split-zip");
}

async function expectCurrentSection(
  page: Page,
  sectionName: string,
): Promise<void> {
  const currentSection = page.getByText(`Current section: ${sectionName}`);

  await expect(currentSection).toHaveText(`Current section: ${sectionName}`);
  await expect(currentSection).toHaveClass(/visually-hidden/);
  await expect(currentSection).toHaveCSS("position", "absolute");
  await expect(currentSection).toHaveCSS("width", "1px");
  await expect(currentSection).toHaveCSS("height", "1px");
}

type NavigationDestination = Readonly<{
  id: string;
  label: string;
}>;

const navigationDestinations: readonly NavigationDestination[] = [
  { id: "split", label: "Split PDF" },
  { id: "merge", label: "Merge PDF" },
  { id: "reorder", label: "Reorder Pages" },
  { id: "rotate", label: "Rotate Pages" },
  { id: "delete", label: "Delete Pages" },
  { id: "metadata", label: "Remove Metadata" },
  { id: "redact", label: "Redact PDF" },
  { id: "privacy", label: "Privacy" },
];

function destinationIntroduction(page: Page, id: string): Locator {
  if (id === "redact") {
    return page.locator("#redact .placeholder-panel p");
  }

  if (id === "privacy") {
    return page.locator("#privacy .privacy-note").first();
  }

  return page.locator(`#${id} .tool-intro`);
}

async function expectDestinationVisible(
  page: Page,
  destination: NavigationDestination,
): Promise<void> {
  const heading = page.locator(`#${destination.id}-title`);
  const introduction = destinationIntroduction(page, destination.id);

  await expect(heading).toBeVisible();
  await expect(introduction).toBeVisible();

  const isDestinationUnobscured = await page.evaluate(
    ({ headingId, introductionSelector }) => {
      const header = document.querySelector<HTMLElement>(".topbar");
      const destinationHeading = document.getElementById(headingId);
      const destinationIntroduction =
        document.querySelector<HTMLElement>(introductionSelector);

      if (
        header === null ||
        destinationHeading === null ||
        destinationIntroduction === null
      ) {
        return false;
      }

      const headerPosition = getComputedStyle(header).position;
      const headerRect = header.getBoundingClientRect();
      const headingRect = destinationHeading.getBoundingClientRect();
      const introductionRect = destinationIntroduction.getBoundingClientRect();
      const obstructionBottom =
        headerPosition === "sticky" || headerPosition === "fixed"
          ? Math.max(0, headerRect.bottom)
          : 0;

      return (
        headingRect.top >= obstructionBottom &&
        introductionRect.top >= obstructionBottom &&
        headingRect.top < window.innerHeight &&
        introductionRect.top < window.innerHeight
      );
    },
    {
      headingId: `${destination.id}-title`,
      introductionSelector:
        destination.id === "redact"
          ? "#redact .placeholder-panel p"
          : destination.id === "privacy"
            ? "#privacy .privacy-note"
            : `#${destination.id} .tool-intro`,
    },
  );

  expect(isDestinationUnobscured).toBe(true);
}

for (const destination of [
  { id: "merge", label: "Merge PDF" },
  { id: "rotate", label: "Rotate Pages" },
  { id: "privacy", label: "Privacy" },
] as const) {
  test(`direct hash loads reveal ${destination.label}`, async ({ page }) => {
    await page.goto(`/#${destination.id}`);

    await expectCurrentSection(page, destination.label);
    await expect(
      page.getByRole("link", { name: destination.label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expectDestinationVisible(page, destination);

    await page.reload();

    await expectCurrentSection(page, destination.label);
    await expectDestinationVisible(page, destination);
  });
}

test("empty hash loads show Home", async ({ page }) => {
  await page.goto("/#");

  await expectCurrentSection(page, "Home");
  await expect(
    page.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("heading", {
      name: "PDF utilities that stay on your device.",
    }),
  ).toBeInViewport();
});

test("navigation clicks reveal every destination", async ({ page }) => {
  await page.goto("/");

  for (const destination of navigationDestinations) {
    await page
      .getByRole("link", { name: destination.label, exact: true })
      .click();
    await expectCurrentSection(page, destination.label);
    await expectDestinationVisible(page, destination);
  }
});

test("hash navigation remains correct through browser history", async ({
  page,
}) => {
  const mergeDestination = { id: "merge", label: "Merge PDF" } as const;
  const splitDestination = { id: "split", label: "Split PDF" } as const;

  await page.goto("/#merge");
  await expectDestinationVisible(page, mergeDestination);

  await page.getByRole("link", { name: "Split PDF", exact: true }).click();
  await expectCurrentSection(page, "Split PDF");
  await expectDestinationVisible(page, splitDestination);

  await page.goBack();
  await expectCurrentSection(page, "Merge PDF");
  await expectDestinationVisible(page, mergeDestination);

  await page.goForward();
  await expectCurrentSection(page, "Split PDF");
  await expectDestinationVisible(page, splitDestination);
});

test("wrapped mobile navigation does not obscure destinations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#merge");

  await expectDestinationVisible(page, {
    id: "merge",
    label: "Merge PDF",
  });

  await page.getByRole("link", { name: "Privacy", exact: true }).click();
  await expectCurrentSection(page, "Privacy");
  await expectDestinationVisible(page, { id: "privacy", label: "Privacy" });
});

test("PDF workflows share an accessible file picker", async ({ page }) => {
  await page.goto("/");

  const fileInputs = page.locator('input[type="file"]');

  await expect(fileInputs).toHaveCount(6);

  for (let index = 0; index < 6; index += 1) {
    const fileInput = fileInputs.nth(index);

    await expect(fileInput).toHaveAttribute("accept", "application/pdf,.pdf");
    await expect(fileInput).toHaveClass(/visually-hidden/);
  }

  await expect(page.locator("#merge-file-input")).toHaveAttribute(
    "multiple",
    "",
  );
  await expect(page.locator("#split-file-input")).not.toHaveAttribute(
    "multiple",
  );
  await expect(page.locator(".drop-zone__action")).toHaveCount(6);
  await expect(
    page.locator("#split").getByLabel("Choose one PDF or drop it here"),
  ).toHaveAttribute("aria-describedby", "split-file-input-instructions");

  const splitInput = page.locator("#split-file-input");
  const splitDropZone = page.locator('label[for="split-file-input"]');

  await splitInput.focus();
  await expect(splitDropZone).toHaveCSS("outline-style", "solid");

  await splitDropZone.evaluate((dropZone) => {
    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(
      new File(["%PDF- shared picker test"], "picker.pdf", {
        type: "application/pdf",
      }),
    );
    dropZone.dispatchEvent(
      new DragEvent("dragenter", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
  });
  await expect(splitDropZone).toHaveClass(/drop-zone--drag-active/);
  await splitDropZone.dispatchEvent("dragleave");
  await expect(splitDropZone).not.toHaveClass(/drop-zone--drag-active/);
});

test("Split PDF discards operations invalidated by definition changes", async ({
  page,
}) => {
  await page.goto("/");
  await mountDeferredSplitHarness(page);

  const splitButton = page.getByRole("button", {
    name: "Split PDF",
    exact: true,
  });
  const splitIntervalInput = page.getByLabel("Pages per split PDF");

  await page.locator("#split-file-input").setInputFiles({
    name: "deferred.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF- deferred test"),
  });
  await expect(page.getByText("deferred.pdf, 2 pages.")).toBeVisible();

  await splitButton.click();
  await page.waitForFunction(
    () =>
      (window as typeof window & { __localFilesSplitRequests?: number })
        .__localFilesSplitRequests === 1,
  );
  await splitIntervalInput.fill("2");
  await splitButton.click();
  await page.waitForFunction(
    () =>
      (window as typeof window & { __localFilesSplitRequests?: number })
        .__localFilesSplitRequests === 2,
  );

  await resolveDeferredSplit(page, 1, 1);
  await expect(page.getByText("part-1-pages-1-2.pdf")).toBeVisible();
  await resolveDeferredSplit(page, 0, 2);
  await expect(page.getByText("part-1-pages-1-2.pdf")).toBeVisible();
  await expect(page.getByText("page-1.pdf")).toHaveCount(0);

  await splitIntervalInput.fill("1");
  await splitButton.click();
  await page.waitForFunction(
    () =>
      (window as typeof window & { __localFilesSplitRequests?: number })
        .__localFilesSplitRequests === 3,
  );
  await page.getByRole("radio", { name: "Custom Ranges" }).check();
  await resolveDeferredSplit(page, 2, 3);
  await expect(page.getByRole("region", { name: "Export result" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("heading", { name: "PDFs Generated" }),
  ).toHaveCount(0);
  await expect(page.getByText("page-1.pdf")).toHaveCount(0);

  const customRangesInput = page.getByLabel("Page ranges");

  await customRangesInput.fill("1");
  await splitButton.click();
  await page.waitForFunction(
    () =>
      (window as typeof window & { __localFilesSplitRequests?: number })
        .__localFilesSplitRequests === 4,
  );
  await customRangesInput.fill("1-2");
  await resolveDeferredSplit(page, 3, 4);
  await expect(page.getByRole("region", { name: "Export result" })).toHaveCount(
    0,
  );

  await splitButton.click();
  await page.waitForFunction(
    () =>
      (window as typeof window & { __localFilesSplitRequests?: number })
        .__localFilesSplitRequests === 5,
  );
  await page.locator("#split-file-input").setInputFiles({
    name: "replacement.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF- replacement test"),
  });
  await expect(page.getByText("replacement.pdf, 2 pages.")).toBeVisible();
  await resolveDeferredSplit(page, 4, 5);
  await expect(page.getByRole("region", { name: "Export result" })).toHaveCount(
    0,
  );

  await splitButton.click();
  await page.waitForFunction(
    () =>
      (window as typeof window & { __localFilesSplitRequests?: number })
        .__localFilesSplitRequests === 6,
  );
  await resolveDeferredSplit(page, 5, 6);
  await expect(page.getByText("part-1-pages-1-2.pdf")).toBeVisible();

  await splitButton.click();
  await page.waitForFunction(
    () =>
      (window as typeof window & { __localFilesSplitRequests?: number })
        .__localFilesSplitRequests === 7,
  );
  await page.getByRole("button", { name: "Clear Split PDF" }).click();
  await resolveDeferredSplit(page, 6, 7);
  await expect(page.getByText("No PDF selected yet.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Export result" })).toHaveCount(
    0,
  );
});

test("LocalFiles web shell supports local-first PDF workflows", async ({
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

  await expect(
    page.getByRole("link", { name: "LocalFiles.org" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "PDF utilities that stay on your device.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Files are processed locally in your browser.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Source code" })).toHaveAttribute(
    "href",
    "https://github.com/cfarmlett/LocalFiles",
  );
  await expect(
    page.getByRole("link", { name: "Privacy details" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/cfarmlett/LocalFiles/blob/main/PRIVACY.md",
  );
  await expect(
    page.getByRole("link", { name: "Security policy" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/cfarmlett/LocalFiles/blob/main/SECURITY.md",
  );
  await expect(
    page.locator("#redact").getByText("Redaction is not available."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "redaction investigation" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/cfarmlett/LocalFiles/blob/main/docs/investigations/redaction.md",
  );

  await page.getByRole("link", { name: "Split PDF" }).click();
  await expectCurrentSection(page, "Split PDF");

  const splitFileInput = page.locator("#split-file-input");
  const splitIntervalOption = page.locator(".split-interval-option");
  const splitIntervalInput = page.getByLabel("Pages per split PDF");

  await expect(splitIntervalOption.getByText("Split every")).toBeVisible();
  await expect(
    splitIntervalOption.getByText("page", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "Split every 1 page" }),
  ).toBeChecked();
  await expect(splitIntervalInput).toHaveValue("1");
  await expect(page.getByText("Pages per file", { exact: true })).toHaveCount(
    0,
  );

  const generateTwoPageSplit = async () => {
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
      page.locator("#split").getByRole("button", { name: "Download ZIP" }),
    ).toBeVisible();
  };

  await generateTwoPageSplit();
  await expect(
    page.locator("#split").getByRole("heading", { name: "PDFs Generated" }),
  ).toBeVisible();
  await expect(
    page.locator("#split").getByText("Generated Files (2)"),
  ).toBeVisible();
  await expect(
    page.locator("#split").getByRole("button", { name: "Download ZIP" }),
  ).toBeVisible();

  const splitZipDownloadPromise = page.waitForEvent("download");
  await page
    .locator("#split")
    .getByRole("button", { name: "Download ZIP" })
    .click();
  const splitZipDownload = await splitZipDownloadPromise;
  const splitZipDownloadPath = await splitZipDownload.path();

  expect(splitZipDownload.suggestedFilename()).toBe("split-source-split.zip");
  expect(splitZipDownloadPath).not.toBeNull();

  const splitZipBytes = await readFile(splitZipDownloadPath ?? "");

  expect(splitZipBytes.subarray(0, 2).toString()).toBe("PK");
  expect(splitZipBytes.toString("utf8")).toContain("page-1.pdf");
  expect(splitZipBytes.toString("utf8")).toContain("page-2.pdf");

  const repeatedSplitZipDownloadPromise = page.waitForEvent("download");
  await page
    .locator("#split")
    .getByRole("button", { name: "Download ZIP" })
    .click();
  const repeatedSplitZipDownload = await repeatedSplitZipDownloadPromise;

  expect(repeatedSplitZipDownload.suggestedFilename()).toBe(
    "split-source-split.zip",
  );

  await expectZipUrlRevokedAfterLateInvalidation(page);

  await generateTwoPageSplit();
  await expectNoStaleZipDownload(page, async () => {
    await page
      .locator("#split")
      .getByRole("button", { name: "Clear Split PDF" })
      .click();
    await expect(
      page.locator("#split").getByText("No PDF selected yet."),
    ).toBeVisible();
  });

  await generateTwoPageSplit();
  await expectNoStaleZipDownload(page, async () => {
    await splitFileInput.setInputFiles({
      name: "replacement.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer(threePagePdf),
    });
    await expect(page.getByText("replacement.pdf, 3 pages.")).toBeVisible();
  });

  await generateTwoPageSplit();
  await expectNoStaleZipDownload(page, async () => {
    await splitIntervalInput.fill("2");
    await expect(page.locator("#split").getByText("page-1.pdf")).toHaveCount(0);
  });

  await expect(
    page.getByRole("radio", { name: "Split every 2 pages" }),
  ).toBeChecked();
  await expect(
    splitIntervalOption.getByText("pages", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Split PDF", exact: true }).click();
  await expect(
    page.locator("#split").getByText("part-1-pages-1-2.pdf"),
  ).toBeVisible();
  await splitIntervalInput.fill("1");
  await expect(
    page.getByRole("radio", { name: "Split every 1 page" }),
  ).toBeChecked();
  await generateTwoPageSplit();
  await expectNoStaleZipDownload(page, async () => {
    await page.getByRole("button", { name: "Split PDF", exact: true }).click();
    await expect(page.locator("#split").getByText("page-1.pdf")).toBeVisible();
  });

  await generateTwoPageSplit();
  await page.locator("#split").getByText("Generated Files (2)").click();
  await expect(page.locator("#split").getByText("page-1.pdf")).toBeHidden();
  await expect(
    page.locator("#split").getByRole("heading", { name: "PDFs Generated" }),
  ).toBeVisible();
  await page
    .locator("#split")
    .getByRole("button", { name: "Clear Split PDF" })
    .click();
  await splitFileInput.setInputFiles({
    name: "split-source.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(twoPagePdf),
  });
  await page.getByRole("button", { name: "Split PDF", exact: true }).click();
  await expect(page.locator("#split").getByText("page-1.pdf")).toBeVisible();

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

  await page.getByRole("radio", { name: "Custom Ranges" }).check();
  await page.getByLabel("Page ranges").fill("1-2");
  await page.getByRole("button", { name: "Split PDF", exact: true }).click();
  await expect(
    page.locator("#split").getByText("part-1-pages-1-2.pdf"),
  ).toBeVisible();
  await expect(
    page.locator("#split").getByRole("button", { name: "Download ZIP" }),
  ).toHaveCount(0);
  await page.getByLabel("Page ranges").fill("1-3");
  await page.getByRole("button", { name: "Split PDF", exact: true }).click();
  await expect(
    page
      .locator("#split")
      .getByText(
        "Page range exceeds document length. This PDF contains 2 pages, but the range includes page 3.",
      ),
  ).toBeVisible();
  await expect(
    page.locator("#split").getByRole("region", { name: "Export result" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#split").getByText("part-1-pages-1-2.pdf"),
  ).toHaveCount(0);

  await expect(splitIntervalInput).toHaveAttribute("tabindex", "-1");
  await splitIntervalInput.click();
  await expect(
    page.getByRole("radio", { name: "Split every 1 page" }),
  ).toBeChecked();
  await expect(page.getByText("page-1.pdf")).toHaveCount(0);
  await splitIntervalInput.fill("0");
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
    page.locator("#split").getByRole("radio", { name: "Split every 1 page" }),
  ).toBeChecked();
  await expect(splitIntervalInput).toHaveValue("1");

  await page.getByRole("link", { name: "Reorder Pages" }).click();
  await expectCurrentSection(page, "Reorder Pages");

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
  await expect(
    page.locator("#reorder").getByText("Page Order (2 Pages)"),
  ).toBeVisible();
  await page.locator("#reorder").getByText("Page Order (2 Pages)").click();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Move page 2 up" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeDisabled();
  await expect(
    page.locator("#reorder").getByText("ordered.pdf, 2 pages."),
  ).toBeVisible();
  await reorderFileInput.setInputFiles({
    name: "replacement.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(onePagePdf),
  });
  await expect(
    page.locator("#reorder").getByText("replacement.pdf, 1 page."),
  ).toBeVisible();
  await expect(
    page.locator("#reorder").getByText("Page Order (1 Page)"),
  ).toBeVisible();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeDisabled();

  await reorderFileInput.setInputFiles({
    name: "replacement.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(twoPagePdf),
  });
  await expect(
    page.locator("#reorder").getByText("replacement.pdf, 2 pages."),
  ).toBeVisible();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Move page 2 up" }),
  ).toBeVisible();

  const pageTwoRow = page.locator("#reorder .file-list__item").filter({
    hasText: "Page 2",
  });
  await pageTwoRow.getByRole("button", { name: "Move page 2 up" }).click();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeEnabled();

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

  await page.locator("#reorder").getByText("Page Order (2 Pages)").click();
  await page
    .locator("#reorder")
    .getByRole("button", { name: "Reset Order" })
    .click();
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#reorder").getByRole("region", { name: "Export result" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#reorder").getByRole("heading", { name: "PDF Generated" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#reorder").getByText("replacement.pdf, 2 pages."),
  ).toBeVisible();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeDisabled();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Move page 2 up" }),
  ).toHaveCount(0);

  await page.locator("#reorder").getByText("Page Order (2 Pages)").click();
  const resetPageNames = await page
    .locator("#reorder .file-list__item strong")
    .allTextContents();
  expect(resetPageNames).toEqual(["Page 1", "Page 2"]);

  await dropPdfOnReorderDropZone(page, "drag-source.pdf", threePagePdf);
  await expect(
    page.locator("#reorder").getByText("drag-source.pdf, 3 pages."),
  ).toBeVisible();
  await expect(
    page.locator("#reorder").getByText("Page Order (3 Pages)"),
  ).toBeVisible();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeDisabled();
  await expect(dragHandle(page, "Page 1")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect(dragHandle(page, "Page 1")).toHaveAttribute(
    "title",
    "Drag to reorder",
  );

  await page
    .getByRole("button", { name: "Reorder Pages", exact: true })
    .click();
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toBeVisible();

  await dropPageDragOnReorderDropZone(dragHandle(page, "Page 1"), page);
  await expect(
    page.locator("#reorder").getByText("drag-source.pdf, 3 pages."),
  ).toBeVisible();
  expect(await reorderPageNames(page)).toEqual(["Page 1", "Page 2", "Page 3"]);
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toBeVisible();
  await expect(page.locator("#reorder .error-list")).toHaveCount(0);

  await cancelDrag(dragHandle(page, "Page 1"));
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toBeVisible();

  await dragPageBefore(dragHandle(page, "Page 1"), reorderRow(page, "Page 1"));
  expect(await reorderPageNames(page)).toEqual(["Page 1", "Page 2", "Page 3"]);
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toBeVisible();

  await dragPageBefore(dragHandle(page, "Page 1"), reorderRow(page, "Page 3"));
  expect(await reorderPageNames(page)).toEqual(["Page 2", "Page 1", "Page 3"]);
  await expect(
    page.locator("#reorder").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#reorder").getByRole("region", { name: "Export result" }),
  ).toHaveCount(0);
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeEnabled();

  await page.locator("#reorder").getByText("Page Order (3 Pages)").click();
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Move page 1 up" }),
  ).toHaveCount(0);
  await page.locator("#reorder").getByText("Page Order (3 Pages)").click();
  expect(await reorderPageNames(page)).toEqual(["Page 2", "Page 1", "Page 3"]);

  await dragPageBefore(dragHandle(page, "Page 1"), reorderRow(page, "Page 2"));
  expect(await reorderPageNames(page)).toEqual(["Page 1", "Page 2", "Page 3"]);
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeDisabled();

  await dragPageBefore(dragHandle(page, "Page 3"), reorderRow(page, "Page 1"));
  expect(await reorderPageNames(page)).toEqual(["Page 3", "Page 1", "Page 2"]);
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeEnabled();

  await page
    .locator("#reorder")
    .getByRole("button", { name: "Reset Order" })
    .click();
  expect(await reorderPageNames(page)).toEqual(["Page 1", "Page 2", "Page 3"]);
  await expect(
    page.locator("#reorder").getByRole("button", { name: "Reset Order" }),
  ).toBeDisabled();

  await dragPageBefore(dragHandle(page, "Page 3"), reorderRow(page, "Page 1"));
  expect(await reorderPageNames(page)).toEqual(["Page 3", "Page 1", "Page 2"]);

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

  expect(reorderDownload.suggestedFilename()).toBe("drag-source-reordered.pdf");
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
  await expectCurrentSection(page, "Rotate Pages");

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
  await expect(
    page.locator("#rotate").getByText("Page Rotations (2 Pages)"),
  ).toBeVisible();
  await page.locator("#rotate").getByText("Page Rotations (2 Pages)").click();
  await expect(
    page
      .locator("#rotate")
      .getByRole("button", { name: "Rotate page 1 right" }),
  ).toHaveCount(0);
  await page.locator("#rotate").getByText("Page Rotations (2 Pages)").click();
  await expect(
    page
      .locator("#rotate")
      .getByRole("button", { name: "Rotate page 1 right" }),
  ).toBeVisible();

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
  await expectCurrentSection(page, "Delete Pages");

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
  await expect(
    page.locator("#delete").getByText("Select Pages to Delete (2 Pages)"),
  ).toBeVisible();
  await page
    .locator("#delete")
    .getByText("Select Pages to Delete (2 Pages)")
    .click();
  await expect(
    page.locator("#delete").getByRole("button", { name: "Delete page 1" }),
  ).toHaveCount(0);
  await page
    .locator("#delete")
    .getByText("Select Pages to Delete (2 Pages)")
    .click();
  await expect(
    page.locator("#delete").getByRole("button", { name: "Delete page 1" }),
  ).toBeVisible();

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
  await expectCurrentSection(page, "Remove Metadata");

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
    page.locator("#metadata").getByText("LocalFiles Test"),
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
    buffer: pdfBuffer(noMetadataPdf),
  });
  await expect(
    page.locator("#metadata").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await expect(
    page
      .locator("#metadata")
      .getByText("No removable standard metadata was found."),
  ).toBeVisible();

  const emptyMetadataDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Remove Metadata", exact: true })
    .click();
  await page
    .locator("#metadata")
    .getByRole("link", { name: "Download PDF" })
    .click();
  const emptyMetadataDownload = await emptyMetadataDownloadPromise;

  expect(emptyMetadataDownload.suggestedFilename()).toBe(
    "metadata-empty-metadata-removed.pdf",
  );

  await metadataFileInput.setInputFiles({
    name: "metadata-empty-metadata-removed.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer(noMetadataPdf),
  });
  await expect(
    page.locator("#metadata").getByRole("link", { name: "Download PDF" }),
  ).toHaveCount(0);
  await expect(
    page
      .locator("#metadata")
      .getByText("No removable standard metadata was found."),
  ).toBeVisible();

  const repeatedMetadataDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Remove Metadata", exact: true })
    .click();
  await page
    .locator("#metadata")
    .getByRole("link", { name: "Download PDF" })
    .click();
  const repeatedMetadataDownload = await repeatedMetadataDownloadPromise;

  expect(repeatedMetadataDownload.suggestedFilename()).toBe(
    "metadata-empty-metadata-removed.pdf",
  );

  await page
    .locator("#metadata")
    .getByRole("button", { name: "Clear Remove Metadata" })
    .click();
  await expect(
    page.locator("#metadata").getByText("No PDF selected yet."),
  ).toBeVisible();
  await expect(page.locator("#metadata").getByText("Title")).toHaveCount(0);

  await page.getByRole("link", { name: "Merge PDF" }).click();
  await expectCurrentSection(page, "Merge PDF");

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
  await expect(
    page.locator("#merge").getByText("Selected PDFs (2)"),
  ).toBeVisible();
  await page.locator("#merge").getByText("Selected PDFs (2)").click();
  await expect(
    page.locator("#merge").getByRole("button", { name: "Move second.pdf up" }),
  ).toHaveCount(0);
  await page.locator("#merge").getByText("Selected PDFs (2)").click();

  const secondRow = page.locator(".file-list__item").filter({
    hasText: "second.pdf",
  });
  await secondRow.getByRole("button", { name: "Move second.pdf up" }).click();

  const fileNames = await page
    .locator("#merge .file-list__item strong")
    .allTextContents();
  expect(fileNames).toEqual(["second.pdf", "first.pdf"]);

  await fileInput.setInputFiles([
    {
      name: "page-10.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer(onePagePdf),
    },
    {
      name: "page-2.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer(onePagePdf),
    },
  ]);
  await expect(page.getByText("4 PDFs selected, 5 total pages.")).toBeVisible();
  expect(
    await page.locator("#merge .file-list__item strong").allTextContents(),
  ).toEqual(["second.pdf", "first.pdf", "page-2.pdf", "page-10.pdf"]);

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

  expect(download.suggestedFilename()).toBe("localfiles-merged.pdf");
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
