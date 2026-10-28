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

  function setFilter(key: FilterKey, value: string) {
    setSearchParams(
      (current) => {
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
  }

  function setPage(nextPage: number) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage > 1) {
        next.set('page', String(nextPage));
      } else {
        next.delete('page');
      }
      return next;
    });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  return {
    page,
    search,
    category,
    hasFilters: Boolean(search || category),
    setSearch: (value: string) => setFilter('search', value),
    setCategory: (value: string) => setFilter('category', value),
    setPage,
    clearFilters,
  };
}
