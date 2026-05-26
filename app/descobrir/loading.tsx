export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-5 w-48 bg-gray-200 rounded-full animate-pulse mt-2" />
      </div>
      <div className="px-4 mt-4 space-y-6">
        {[1, 2, 3].map((g) => (
          <div key={g}>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-3" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse mb-2" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
