/**
 * 🧾 INTEGRAÇÃO NF-e (NOTA FISCAL ELETRÔNICA)
 *
 * Requisito legal no Brasil: Todo e-commerce precisa emitir NF-e para cada venda.
 *
 * Provedores suportados:
 * - NFe.io (https://nfe.io)
 * - Bling (https://www.bling.com.br)
 * - Tiny ERP (https://www.tiny.com.br)
 *
 * Fluxo:
 * 1. Pedido aprovado (webhook do Mercado Pago)
 * 2. Emitir NF-e via API
 * 3. Salvar chave NF-e no banco (campo nfe_key)
 * 4. Enviar PDF DANFE por email ao cliente
 */

interface NFEProduct {
  codigo: string;
  descricao: string;
  ncm: string; // Nomenclatura Comum do Mercosul
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface NFECustomer {
  nome: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

interface NFERequest {
  naturezaOperacao: "Venda de mercadoria"; // Tipo de operação
  produtos: NFEProduct[];
  cliente: NFECustomer;
  valorTotal: number;
  formaPagamento: "Cartão de Crédito" | "PIX" | "Boleto" | "Wallet";
}

interface NFEResponse {
  success: boolean;
  nfeKey?: string; // Chave de acesso (44 dígitos)
  danfeUrl?: string; // URL do PDF da DANFE
  protocolo?: string; // Número do protocolo de autorização
  xml?: string; // XML da NF-e
  error?: string;
}

/**
 * Emitir NF-e usando NFe.io
 */
export async function emitNFeIO(data: NFERequest): Promise<NFEResponse> {
  const apiKey = process.env.NFE_IO_API_KEY;
  const companyId = process.env.NFE_IO_COMPANY_ID;

  if (!apiKey || !companyId) {
    return {
      success: false,
      error: "NFe.io não configurado (faltam credenciais)",
    };
  }

  try {
    const response = await fetch(
      `https://api.nfe.io/v1/companies/${companyId}/serviceinvoices`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrower: {
            name: data.cliente.nome,
            email: data.cliente.email,
            federalTaxNumber:
              data.cliente.cpf || data.cliente.cnpj || "00000000000",
            address: {
              street: data.cliente.endereco.logradouro,
              number: data.cliente.endereco.numero,
              additionalInformation: data.cliente.endereco.complemento || "",
              district: data.cliente.endereco.bairro,
              city: {
                name: data.cliente.endereco.cidade,
              },
              state: data.cliente.endereco.estado,
              postalCode: data.cliente.endereco.cep.replace(/\D/g, ""),
            },
          },
          items: data.produtos.map((p) => ({
            description: p.descricao,
            quantity: p.quantidade,
            unitValue: p.valorUnitario,
          })),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Erro ao emitir NF-e (NFe.io):", error);
      return {
        success: false,
        error: error.message || "Erro ao emitir NF-e",
      };
    }

    const result = await response.json();

    return {
      success: true,
      nfeKey: result.number, // NFe.io retorna o número da nota
      danfeUrl: result.pdfUrl,
      protocolo: result.verificationCode,
    };
  } catch (error) {
    console.error("❌ Exceção ao emitir NF-e:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Emitir NF-e usando Bling
 */
export async function emitBling(data: NFERequest): Promise<NFEResponse> {
  const apiKey = process.env.BLING_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Bling não configurado (faltam credenciais)",
    };
  }

  try {
    const response = await fetch(
      "https://bling.com.br/Api/v2/notafiscal/json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: apiKey,
          xml: `
          <notafiscal>
            <naturezaOperacao>${data.naturezaOperacao}</naturezaOperacao>
            <cliente>
              <nome>${data.cliente.nome}</nome>
              <cpf_cnpj>${data.cliente.cpf || data.cliente.cnpj}</cpf_cnpj>
              <email>${data.cliente.email}</email>
              <endereco>${data.cliente.endereco.logradouro}</endereco>
              <numero>${data.cliente.endereco.numero}</numero>
              <bairro>${data.cliente.endereco.bairro}</bairro>
              <cidade>${data.cliente.endereco.cidade}</cidade>
              <uf>${data.cliente.endereco.estado}</uf>
              <cep>${data.cliente.endereco.cep}</cep>
            </cliente>
            <itens>
              ${data.produtos
                .map(
                  (p) => `
                <item>
                  <codigo>${p.codigo}</codigo>
                  <descricao>${p.descricao}</descricao>
                  <quantidade>${p.quantidade}</quantidade>
                  <valorunidade>${p.valorUnitario}</valorunidade>
                  <codigo_ncm>${p.ncm}</codigo_ncm>
                </item>
              `
                )
                .join("")}
            </itens>
          </notafiscal>
        `,
        }),
      }
    );

    const result = await response.json();

    if (result.retorno?.erros) {
      console.error("❌ Erro ao emitir NF-e (Bling):", result.retorno.erros);
      return {
        success: false,
        error: result.retorno.erros[0]?.erro?.msg || "Erro ao emitir NF-e",
      };
    }

    const nf = result.retorno?.notasfiscais?.[0]?.notafiscal;

    return {
      success: true,
      nfeKey: nf?.chaveAcesso,
      danfeUrl: nf?.linkDanfe,
      xml: nf?.xml,
    };
  } catch (error) {
    console.error("❌ Exceção ao emitir NF-e (Bling):", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Wrapper genérico - tenta emitir NF-e com o provedor configurado
 */
export async function emitNFe(data: NFERequest): Promise<NFEResponse> {
  const provider = process.env.NFE_PROVIDER || "nfe.io"; // ou 'bling', 'tiny'

  console.log(`📝 Emitindo NF-e via ${provider}...`);

  switch (provider) {
    case "nfe.io":
      return await emitNFeIO(data);
    case "bling":
      return await emitBling(data);
    default:
      return {
        success: false,
        error: `Provedor de NF-e não suportado: ${provider}`,
      };
  }
}

/**
 * Consultar status de uma NF-e emitida
 */
export async function consultNFeStatus(nfeKey: string): Promise<{
  status: "autorizada" | "cancelada" | "pendente" | "rejeitada";
  message?: string;
}> {
  const provider = process.env.NFE_PROVIDER || "nfe.io";

  if (provider === "nfe.io") {
    const apiKey = process.env.NFE_IO_API_KEY;
    const companyId = process.env.NFE_IO_COMPANY_ID;

    try {
      const response = await fetch(
        `https://api.nfe.io/v1/companies/${companyId}/serviceinvoices/${nfeKey}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const data = await response.json();
      return {
        status: data.status === "Issued" ? "autorizada" : "pendente",
        message: data.statusMessage,
      };
    } catch (error) {
      return {
        status: "pendente",
        message: "Erro ao consultar status",
      };
    }
  }

  return {
    status: "pendente",
    message: "Consulta não implementada para este provedor",
  };
}
