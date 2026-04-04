export class RadishError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RadishError";
  }
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}
