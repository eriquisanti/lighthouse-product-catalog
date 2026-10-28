import { Skeleton } from '@/components/ui/Skeleton';

export function ProductFormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando produto"
      className="max-w-3xl rounded-xl border border-line bg-white"
    >
      <div className="grid gap-5 p-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
