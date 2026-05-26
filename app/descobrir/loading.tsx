export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] max-w-lg mx-auto flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center animate-pulse">
        <span className="text-4xl">🗺️</span>
      </div>
      <h2 className="text-xl font-bold text-gray-800">Encontrando os melhores lugares...</h2>
      <p className="text-gray-500 text-sm">Buscando opções perto de você no OpenStreetMap</p>
      <div className="flex gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
