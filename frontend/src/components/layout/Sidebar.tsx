import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router';
import { PackageIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { BrandMark } from './BrandMark';

type NavigationItem = {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navigationItems: NavigationItem[] = [
  { label: 'Produtos', to: '/products', icon: PackageIcon },
];

export function Sidebar() {
  return (
    <aside className="flex shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-4 py-3 md:sticky md:top-0 md:h-dvh md:w-64 md:flex-col md:items-stretch md:justify-start md:gap-8 md:border-r md:border-b-0 md:px-5 md:py-6">
      <BrandMark />

      <nav aria-label="Navegação principal">
        <p className="mb-2 hidden px-3 text-xs font-medium tracking-wider text-muted uppercase md:block">
          Catálogo
        </p>
        <ul className="flex gap-1 md:flex-col">
          {navigationItems.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-soft text-ink before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-brand'
                      : 'text-muted hover:bg-canvas hover:text-ink',
                  )
                }
              >
                <Icon className="text-brand" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
