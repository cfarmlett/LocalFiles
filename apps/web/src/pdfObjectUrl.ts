export function createPdfObjectUrl(bytes: Uint8Array): string {
  const pdfBytes = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(pdfBytes).set(bytes);

  return URL.createObjectURL(
    new Blob([pdfBytes], {
      type: "application/pdf",
    }),
  );
}
