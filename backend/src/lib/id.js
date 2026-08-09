import { randomUUID } from 'node:crypto';

export function uid(prefix) {
  return `${prefix}-${randomUUID()}`;
}
