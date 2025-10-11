/**
 * Generic factory utility for building TanStack Query keys per domain.
 */

export type DomainQueryKeyFactory<Identifier = string, Filters = Record<string, unknown>> = {
  readonly all: readonly [string];
  lists: () => readonly [string, 'list'];
  list: (filters?: Filters) => readonly [string, 'list', Filters | undefined];
  details: () => readonly [string, 'detail'];
  detail: (id: Identifier) => readonly [string, 'detail', Identifier];
  extras?: Record<string, (...args: never[]) => readonly unknown[]>;
};

export function createDomainQueryKeys<Identifier = string, Filters = Record<string, unknown>>(
  domain: string,
  options?: {
    extras?: Record<string, (...args: never[]) => readonly unknown[]>;
  },
): DomainQueryKeyFactory<Identifier, Filters> {
  const base = [domain] as const;

  const factory: DomainQueryKeyFactory<Identifier, Filters> = {
    all: base,
    lists: () => [...base, 'list'] as const,
    list: (filters?: Filters) => [...base, 'list', filters] as const,
    details: () => [...base, 'detail'] as const,
    detail: (id: Identifier) => [...base, 'detail', id] as const,
  };

  if (options?.extras) {
    factory.extras = Object.fromEntries(
      Object.entries(options.extras).map(([key, builder]) => [
        key,
        (...args: never[]) => [...base, key, ...builder(...args)] as const,
      ]),
    );
  }

  return factory;
}
