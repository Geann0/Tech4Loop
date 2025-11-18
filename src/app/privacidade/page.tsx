export default function PrivacidadePage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <p className="text-gray-400 mb-8">
          Última atualização: 14 de Novembro de 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
          <p className="text-gray-300 mb-4">
            A Tech4Loop respeita sua privacidade e está comprometida em proteger
            seus dados pessoais. Esta política explica como coletamos, usamos e
            protegemos suas informações.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Dados que Coletamos</h2>
          <p className="text-gray-300 mb-4">
            Coletamos e processamos os seguintes tipos de informações:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>
              <strong>Dados de Cadastro:</strong> nome, email, telefone/WhatsApp
            </li>
            <li>
              <strong>Dados de Compra:</strong> endereço de entrega, CPF (quando
              aplicável)
            </li>
            <li>
              <strong>Dados de Pagamento:</strong> processados pelo Mercado Pago
              (não armazenamos dados de cartão)
            </li>
            <li>
              <strong>Dados de Navegação:</strong> cookies, IP, navegador,
              páginas visitadas
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Como Usamos seus Dados</h2>
          <p className="text-gray-300 mb-4">
            Utilizamos seus dados pessoais para:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Processar e entregar seus pedidos</li>
            <li>Comunicar sobre o status do pedido</li>
            <li>Fornecer suporte ao cliente</li>
            <li>Melhorar nossos serviços e experiência do usuário</li>
            <li>Enviar comunicações de marketing (com seu consentimento)</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            4. Compartilhamento de Dados
          </h2>
          <p className="text-gray-300 mb-4">
            Podemos compartilhar seus dados com:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>
              <strong>Processadores de Pagamento:</strong> Mercado Pago para
              processar transações
            </li>
            <li>
              <strong>Serviços de Entrega:</strong> para realizar a entrega dos
              produtos
            </li>
            <li>
              <strong>Parceiros:</strong> vendedores que fornecem os produtos
              comprados
            </li>
            <li>
              <strong>Provedores de Serviços:</strong> que nos ajudam a operar o
              site (hospedagem, email, etc.)
            </li>
          </ul>
          <p className="text-gray-300 mb-4">
            Não vendemos ou alugamos suas informações pessoais a terceiros.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
          <p className="text-gray-300 mb-4">
            Utilizamos cookies para melhorar sua experiência no site. Cookies
            são pequenos arquivos de texto armazenados no seu dispositivo. Você
            pode controlar o uso de cookies nas configurações do seu navegador.
          </p>
          <p className="text-gray-300 mb-4">Tipos de cookies que usamos:</p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>
              <strong>Essenciais:</strong> necessários para o funcionamento do
              site
            </li>
            <li>
              <strong>Funcionais:</strong> lembram suas preferências (carrinho,
              idioma)
            </li>
            <li>
              <strong>Analíticos:</strong> nos ajudam a entender como você usa o
              site
            </li>
            <li>
              <strong>Marketing:</strong> rastreiam sua atividade para
              personalizar anúncios
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Segurança dos Dados</h2>
          <p className="text-gray-300 mb-4">
            Implementamos medidas técnicas e organizacionais apropriadas para
            proteger seus dados pessoais contra acesso não autorizado,
            alteração, divulgação ou destruição.
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Criptografia SSL/TLS para transmissão de dados</li>
            <li>Armazenamento seguro em servidores protegidos</li>
            <li>Acesso restrito aos dados pessoais</li>
            <li>Revisões regulares de segurança</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Seus Direitos (LGPD)</h2>
          <p className="text-gray-300 mb-4">
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os
            seguintes direitos:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>
              <strong>Acesso:</strong> solicitar cópias dos seus dados pessoais
            </li>
            <li>
              <strong>Correção:</strong> solicitar correção de dados incorretos
              ou incompletos
            </li>
            <li>
              <strong>Exclusão:</strong> solicitar a exclusão dos seus dados
              (direito ao esquecimento)
            </li>
            <li>
              <strong>Portabilidade:</strong> receber seus dados em formato
              estruturado
            </li>
            <li>
              <strong>Revogação de Consentimento:</strong> retirar consentimento
              a qualquer momento
            </li>
            <li>
              <strong>Oposição:</strong> opor-se ao processamento dos seus dados
            </li>
          </ul>
          <p className="text-gray-300 mb-4">
            Para exercer esses direitos, entre em contato conosco através do
            email: privacidade@tech4loop.com.br
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Retenção de Dados</h2>
          <p className="text-gray-300 mb-4">
            Mantemos seus dados pessoais apenas pelo tempo necessário para
            cumprir os propósitos para os quais foram coletados, incluindo
            requisitos legais, contábeis ou de relatório.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Menores de Idade</h2>
          <p className="text-gray-300 mb-4">
            Nosso site não é direcionado a menores de 18 anos. Não coletamos
            intencionalmente informações de menores de idade. Se você é pai/mãe
            e acredita que seu filho nos forneceu dados pessoais, entre em
            contato conosco.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            10. Alterações nesta Política
          </h2>
          <p className="text-gray-300 mb-4">
            Podemos atualizar esta política de privacidade periodicamente.
            Notificaremos você sobre quaisquer alterações significativas
            publicando a nova política nesta página e atualizando a data de
            &quot;Última atualização&quot;.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Contato</h2>
          <p className="text-gray-300 mb-4">
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre
            como tratamos seus dados pessoais, entre em contato:
          </p>
          <ul className="list-none text-gray-300 space-y-2">
            <li>Email: privacidade@tech4loop.com.br</li>
            <li>Email geral: contato@tech4loop.com.br</li>
            <li>WhatsApp: {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            12. Encarregado de Dados (DPO)
          </h2>
          <p className="text-gray-300 mb-4">
            Para questões específicas sobre proteção de dados, você pode entrar
            em contato com nosso Encarregado de Proteção de Dados (DPO):
          </p>
          <p className="text-gray-300">Email: dpo@tech4loop.com.br</p>
        </section>
      </div>
    </div>
  );
}
