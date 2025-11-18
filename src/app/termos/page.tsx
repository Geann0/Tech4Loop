export default function TermosPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>

        <p className="text-gray-400 mb-8">
          Última atualização: 14 de Novembro de 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
          <p className="text-gray-300 mb-4">
            Ao acessar e usar o site Tech4Loop, você concorda em cumprir e estar
            vinculado aos seguintes termos e condições de uso. Se você não
            concordar com qualquer parte destes termos, não deverá usar nosso
            site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Uso do Site</h2>
          <p className="text-gray-300 mb-4">
            Você concorda em usar este site apenas para fins legais e de maneira
            que não infrinja os direitos, nem restrinja ou iniba o uso e
            aproveitamento deste site por terceiros.
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Não publicar conteúdo ofensivo ou ilegal</li>
            <li>Não tentar acessar áreas restritas do site</li>
            <li>Não usar o site para distribuir malware ou vírus</li>
            <li>Não fazer uso comercial não autorizado do conteúdo</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Compras e Pagamentos</h2>
          <p className="text-gray-300 mb-4">
            Ao realizar uma compra em nosso site, você concorda em fornecer
            informações precisas e completas. Todas as transações estão sujeitas
            à disponibilidade de produto e confirmação de preço.
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>
              Os preços estão em Reais (BRL) e incluem impostos quando aplicável
            </li>
            <li>O pagamento é processado através do Mercado Pago</li>
            <li>
              Reservamo-nos o direito de cancelar pedidos em caso de erro de
              preço
            </li>
            <li>Você receberá confirmação por email após a compra</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Entregas e Devoluções</h2>
          <p className="text-gray-300 mb-4">
            Os prazos de entrega são estimados e podem variar. Você tem o
            direito de desistir da compra dentro de 7 dias úteis após o
            recebimento, conforme o Código de Defesa do Consumidor.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            5. Propriedade Intelectual
          </h2>
          <p className="text-gray-300 mb-4">
            Todo o conteúdo deste site, incluindo textos, gráficos, logos,
            imagens e software, é propriedade da Tech4Loop ou de seus
            fornecedores de conteúdo e está protegido por leis de direitos
            autorais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            6. Limitação de Responsabilidade
          </h2>
          <p className="text-gray-300 mb-4">
            A Tech4Loop não será responsável por quaisquer danos diretos,
            indiretos, incidentais, especiais ou consequenciais resultantes do
            uso ou incapacidade de usar este site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Modificações</h2>
          <p className="text-gray-300 mb-4">
            Reservamo-nos o direito de modificar estes termos a qualquer
            momento. As alterações entrarão em vigor imediatamente após a
            publicação no site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Lei Aplicável</h2>
          <p className="text-gray-300 mb-4">
            Estes termos são regidos e interpretados de acordo com as leis do
            Brasil. Qualquer disputa será resolvida nos tribunais brasileiros.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Contato</h2>
          <p className="text-gray-300 mb-4">
            Se você tiver dúvidas sobre estes Termos de Uso, entre em contato
            conosco:
          </p>
          <ul className="list-none text-gray-300 space-y-2">
            <li>Email: contato@tech4loop.com.br</li>
            <li>WhatsApp: {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
