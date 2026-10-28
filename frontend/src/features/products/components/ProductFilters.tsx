import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type ProductFiltersProps = {
  search: string;
  category: string;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClear: () => void;
};

export function ProductFilters({
  search,
  category,
  hasFilters,
  onSearchChange,
  onCategoryChange,
  onClear,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <label htmlFor="product-search" className="sr-only">
          Buscar por nome
        </label>
        <Input
          id="product-search"
          type="search"
          placeholder="Buscar por nome"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          icon={<Search size={16} />}
        />
      </div>
      <div className="sm:w-56">
        <label htmlFor="product-category" className="sr-only">
          Filtrar por categoria
        </label>
        <Input
          id="product-category"
          placeholder="Categoria"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        />
      </div>
      {hasFilters && (
        <Button variant="ghost" onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
