import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="h-10 bg-gray-700 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <div className="h-10 bg-gray-700 rounded-lg w-24 animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded-lg w-32 animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded-lg w-20 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
