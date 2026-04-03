export class RadishError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RadishError";
  }
}
