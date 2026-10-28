export const PAGE_SIZES = [20, 40, 60] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface DirectoryUrlState {
  q: string;
  domain: string;
  region: string;
  sort: string;
  perPage: PageSize;
}

const DEFAULT_STATE: DirectoryUrlState = {
  q: '',
  domain: '',
  region: '',
  sort: 'name-asc',
  perPage: 20,
};

const SORTS = new Set(['name-asc', 'name-desc', 'verified-desc']);

/** Read the shareable directory state from a URL query string. */
export function readDirectoryState(search: string): DirectoryUrlState {
  const params = new URLSearchParams(search);
  const candidate = Number(params.get('per_page'));
  const perPage = PAGE_SIZES.includes(candidate as PageSize)
    ? (candidate as PageSize)
    : DEFAULT_STATE.perPage;
  return {
    q: params.get('q') ?? '',
    domain: params.get('domain') ?? '',
    region: params.get('region') ?? '',
    sort: SORTS.has(params.get('sort') ?? '') ? (params.get('sort') as string) : DEFAULT_STATE.sort,
    perPage,
  };
}

/** Serialize directory state, omitting defaults so the URL stays short. */
export function writeDirectoryState(state: DirectoryUrlState): string {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.domain) params.set('domain', state.domain);
  if (state.region) params.set('region', state.region);
  if (state.sort !== DEFAULT_STATE.sort) params.set('sort', state.sort);
  if (state.perPage !== DEFAULT_STATE.perPage) params.set('per_page', String(state.perPage));
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Keep a page number inside the range produced by the current filters. */
export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, Math.floor(page) || 1), Math.max(1, totalPages));
}
