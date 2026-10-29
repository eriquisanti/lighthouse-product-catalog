import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

type FilterKey = 'search' | 'category';

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePage(searchParams.get('page'));
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      setSearchParams(
        (current) => {
          if ((current.get(key) ?? '') === value) {
            return current;
          }

          const next = new URLSearchParams(current);
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  const setCategory = useCallback((value: string) => setFilter('category', value), [setFilter]);

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (nextPage > 1) {
          next.set('page', String(nextPage));
        } else {
          next.delete('page');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return { page, search, category, setSearch, setCategory, setPage, clearFilters };
}
