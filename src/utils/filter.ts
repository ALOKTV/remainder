import { SortMode } from '../types/models';

export function matchesSearch(values: Array<string | null | undefined>, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => (value ?? '').toLowerCase().includes(normalized));
}

export function sortByMode<T extends { title: string; createdAt: string }>(items: T[], sort: SortMode): T[] {
  return [...items].sort((a, b) => {
    if (sort === 'alphabetical') return a.title.localeCompare(b.title);
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === 'oldest' ? diff : -diff;
  });
}
