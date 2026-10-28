import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCreatePage } from '@/features/products/pages/ProductCreatePage';
import { ProductEditPage } from '@/features/products/pages/ProductEditPage';
import { ProductListPage } from '@/features/products/pages/ProductListPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/products" replace /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <ProductCreatePage /> },
      { path: 'products/:id/edit', element: <ProductEditPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
