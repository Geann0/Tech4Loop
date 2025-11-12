export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Coluna de Texto */}
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-6">Nossa Jornada</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            A Tech4Loop nasceu da paixão por tecnologia e da vontade de oferecer
            produtos de qualidade a preços justos. Começamos pequeno, mas com
            grandes planos — e cada cliente faz parte dessa jornada.
          </p>
          <div className="mt-8 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-neon-blue">Missão</h3>
              <p className="text-gray-400">
                Conectar pessoas através da tecnologia, oferecendo produtos
                inovadores e acessíveis.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-neon-blue">Valores</h3>
              <p className="text-gray-400">
                Qualidade, transparência e a satisfação de nossos clientes são
                os pilares do nosso negócio.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna de Imagem */}
        <div className="w-full h-80 bg-gray-800 rounded-lg flex items-center justify-center border border-electric-purple">
          <span className="text-gray-500">Foto da equipe / produto</span>
        </div>
      </div>
    </div>
  );
}
