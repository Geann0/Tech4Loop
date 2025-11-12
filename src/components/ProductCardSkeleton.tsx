export default function ProductCardSkeleton() {
  return (
    <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 flex flex-col animate-pulse">
      <div className="w-full h-56 bg-gray-700"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-700 rounded w-full mt-auto"></div>
      </div>
    </div>
  );
}
