const allowedZips = new Set([
  "90804","90805","90806","90807","90808","90809","90810","90811","90812","90813","90814",
]);

export function isDeliveryZipAllowed(zip: string) {
  const z = String(zip ?? "").trim();
  return allowedZips.has(z);
}
