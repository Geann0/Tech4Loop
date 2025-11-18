import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perguntas Frequentes | Tech4Loop",
  description:
    "Tire suas dúvidas sobre compras, entregas, pagamentos e muito mais na Tech4Loop.",
};

export default function FAQPage() {
  const faqs = [
    {
      category: "Compras e Pagamentos",
      questions: [
        {
          q: "Quais formas de pagamento vocês aceitam?",
          a: "Aceitamos pagamentos via Mercado Pago, incluindo cartão de crédito, débito, PIX e boleto bancário.",
        },
        {
          q: "Posso parcelar minha compra?",
          a: "Sim! Dependendo do valor da compra, você pode parcelar em até 12x sem juros no cartão de crédito através do Mercado Pago.",
        },
        {
          q: "Quanto tempo leva para processar meu pedido?",
          a: "Após a confirmação do pagamento, processamos seu pedido em até 2 dias úteis antes do envio.",
        },
        {
          q: "Posso cancelar meu pedido?",
          a: "Sim, você pode cancelar seu pedido antes do envio. Entre em contato conosco pelo WhatsApp ou email.",
        },
      ],
    },
    {
      category: "Entrega",
      questions: [
        {
          q: "Quanto tempo leva a entrega?",
          a: "O prazo de entrega varia de acordo com sua região e é calculado no momento da compra. Em média, de 7 a 15 dias úteis.",
        },
        {
          q: "Como posso rastrear meu pedido?",
          a: "Após o envio, você receberá um código de rastreamento por email. Você também pode acompanhar o status na sua conta.",
        },
        {
          q: "Vocês entregam em todo o Brasil?",
          a: "Sim! Fazemos entregas para todo o território nacional.",
        },
        {
          q: "Quanto custa o frete?",
          a: "O valor do frete é calculado automaticamente com base em seu CEP e no peso/volume dos produtos.",
        },
      ],
    },
    {
      category: "Produtos",
      questions: [
        {
          q: "Os produtos têm garantia?",
          a: "Sim! Todos os produtos possuem garantia mínima de 90 dias do fabricante, além dos 7 dias de direito de arrependimento.",
        },
        {
          q: "Posso trocar ou devolver um produto?",
          a: "Você tem 7 dias úteis após o recebimento para desistir da compra, conforme o Código de Defesa do Consumidor.",
        },
        {
          q: "Como sei se o produto está em estoque?",
          a: 'Todos os produtos disponíveis em nosso site estão em estoque. Se um produto não estiver disponível, ele aparecerá como "Indisponível".',
        },
        {
          q: "Os produtos são novos ou usados?",
          a: "Todos os nossos produtos são novos e originais, fornecidos por parceiros verificados.",
        },
      ],
    },
    {
      category: "Conta e Cadastro",
      questions: [
        {
          q: "Preciso criar uma conta para comprar?",
          a: "Sim, é necessário criar uma conta para finalizar compras e acompanhar seus pedidos.",
        },
        {
          q: "Esqueci minha senha, o que faço?",
          a: 'Use a opção "Esqueci minha senha" na página de login para receber um email de recuperação.',
        },
        {
          q: "Como altero meus dados cadastrais?",
          a: 'Acesse "Minha Conta" e clique em "Editar Perfil" para atualizar suas informações.',
        },
        {
          q: "Meus dados estão seguros?",
          a: "Sim! Seguimos todas as normas da LGPD e utilizamos criptografia para proteger seus dados. Veja nossa Política de Privacidade.",
        },
      ],
    },
    {
      category: "Seja Parceiro",
      questions: [
        {
          q: "Como posso vender na Tech4Loop?",
          a: 'Cadastre-se como parceiro em "Seja Parceiro", preencha seus dados e aguarde aprovação. Após aprovado, você poderá cadastrar produtos.',
        },
        {
          q: "Qual a taxa para vender?",
          a: "Entre em contato conosco para conhecer nosso modelo de comissão e benefícios para parceiros.",
        },
        {
          q: "Como recebo pelos produtos vendidos?",
          a: "O pagamento é processado após a confirmação de entrega do produto ao cliente.",
        },
        {
          q: "Posso vender produtos usados?",
          a: "No momento, aceitamos apenas produtos novos e originais.",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-gray-400 text-lg">
            Encontre respostas rápidas para as dúvidas mais comuns
          </p>
        </div>

        <div className="space-y-12">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold mb-6 text-neon-blue">
                {category.category}
              </h2>

              <div className="space-y-6">
                {category.questions.map((faq, faqIndex) => (
                  <div
                    key={faqIndex}
                    className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-neon-blue/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold mb-3 text-white">
                      {faq.q}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-neon-blue/10 to-electric-purple/10 border border-neon-blue/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Não encontrou o que procura?
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Nossa equipe está pronta para ajudar você!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            <a
              href="/contato"
              className="inline-flex items-center justify-center gap-2 bg-neon-blue hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
