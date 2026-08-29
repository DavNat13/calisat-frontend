export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Equipamiento de{' '}
            <span className="text-[#EA580C]">Calistenia</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Anillas, paralelas para handstand, bandas y magnesia para dominar el muscle-up.
          </p>
          <a
            href="/productos"
            className="inline-block bg-[#EA580C] hover:bg-[#c2410c] text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Ver Catálogo
          </a>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Categorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { nombre: 'Anillas', descripcion: 'Para muscle-up y dominadas' },
              { nombre: 'Paralelas', descripcion: 'Para handstand y planche' },
              { nombre: 'Bandas', descripcion: 'Resistencia y asistencia' },
              { nombre: 'Magnesia', descripcion: 'Agarre perfecto' },
            ].map((cat) => (
              <div
                key={cat.nombre}
                className="bg-[#020617] border border-gray-800 rounded-lg p-6 hover:border-[#EA580C] transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{cat.nombre}</h3>
                <p className="text-gray-400">{cat.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
