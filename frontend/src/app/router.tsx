import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductListPage } from '@/features/products/pages/ProductListPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <div className="min-h-dvh bg-canvas" />,
    children: [
      { index: true, element: <Navigate to="/products" replace /> },
      { path: 'products', element: <ProductListPage /> },
      {
        path: 'products/new',
        lazy: async () => {
          const { ProductCreatePage } = await import('@/features/products/pages/ProductCreatePage');
          return { Component: ProductCreatePage };
        },
      },
      {
        path: 'products/:id/edit',
        lazy: async () => {
          const { ProductEditPage } = await import('@/features/products/pages/ProductEditPage');
          return { Component: ProductEditPage };
        },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
