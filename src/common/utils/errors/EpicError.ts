import { serializeError } from 'serialize-error';

export class EpicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EpicError';
  }

  public toJSON() {
    return serializeError(this);
  }
}
