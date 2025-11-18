/**
 * 📦 INTEGRAÇÃO COM APIs DE ENVIO PARA ETIQUETAS
 *
 * Provedores suportados:
 * - Melhor Envio (https://melhorenvio.com.br)
 * - Correios (https://www.correios.com.br/enviar-e-receber/ferramentas/sigep-web)
 *
 * Fluxo:
 * 1. Pedido aprovado
 * 2. Calcular frete (já implementado em geolocation.ts)
 * 3. Gerar etiqueta
 * 4. Salvar tracking_code no banco
 * 5. Enviar código de rastreio para cliente
 */

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

interface ShippingPackage {
  weight: number; // em kg
  height: number; // em cm
  width: number; // em cm
  length: number; // em cm
}

interface ShippingQuote {
  carrier: string; // 'correios', 'jadlog', 'loggi', etc.
  service: string; // 'pac', 'sedex', 'normal', etc.
  price: number;
  deliveryDays: number;
  company: {
    id: number;
    name: string;
  };
}

interface LabelResponse {
  success: boolean;
  trackingCode?: string;
  labelUrl?: string; // URL do PDF da etiqueta
  error?: string;
}

/**
 * Cotação de frete via Melhor Envio
 */
export async function quoteMelhorEnvio(
  from: string, // CEP origem
  to: string, // CEP destino
  packageInfo: ShippingPackage
): Promise<ShippingQuote[]> {
  const apiToken = process.env.MELHOR_ENVIO_TOKEN;

  if (!apiToken) {
    console.error("❌ Token do Melhor Envio não configurado");
    return [];
  }

  try {
    const response = await fetch(
      "https://melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          from: {
            postal_code: from.replace(/\D/g, ""),
          },
          to: {
            postal_code: to.replace(/\D/g, ""),
          },
          package: {
            height: packageInfo.height,
            width: packageInfo.width,
            length: packageInfo.length,
            weight: packageInfo.weight,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Erro ao cotar frete Melhor Envio:", error);
      return [];
    }

    const quotes = await response.json();

    return quotes.map((q: any) => ({
      carrier: q.company.name.toLowerCase(),
      service: q.name,
      price: q.price,
      deliveryDays: q.delivery_range.max,
      company: {
        id: q.company.id,
        name: q.company.name,
      },
    }));
  } catch (error) {
    console.error("❌ Exceção ao cotar frete:", error);
    return [];
  }
}

/**
 * Gerar etiqueta via Melhor Envio
 */
export async function generateMelhorEnvioLabel(
  orderId: string,
  from: ShippingAddress,
  to: ShippingAddress,
  packageInfo: ShippingPackage,
  serviceId: number // ID do serviço escolhido na cotação
): Promise<LabelResponse> {
  const apiToken = process.env.MELHOR_ENVIO_TOKEN;

  if (!apiToken) {
    return {
      success: false,
      error: "Token do Melhor Envio não configurado",
    };
  }

  try {
    // 1. Criar envio (shipment)
    const createResponse = await fetch(
      "https://melhorenvio.com.br/api/v2/me/cart",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          service: serviceId,
          from: {
            name: from.name,
            phone: from.phone.replace(/\D/g, ""),
            address: from.address,
            number: from.number,
            complement: from.complement || "",
            district: from.neighborhood,
            city: from.city,
            state_abbr: from.state,
            postal_code: from.postalCode.replace(/\D/g, ""),
          },
          to: {
            name: to.name,
            phone: to.phone.replace(/\D/g, ""),
            address: to.address,
            number: to.number,
            complement: to.complement || "",
            district: to.neighborhood,
            city: to.city,
            state_abbr: to.state,
            postal_code: to.postalCode.replace(/\D/g, ""),
          },
          package: {
            height: packageInfo.height,
            width: packageInfo.width,
            length: packageInfo.length,
            weight: packageInfo.weight,
          },
          options: {
            receipt: false,
            own_hand: false,
          },
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error("❌ Erro ao criar envio:", error);
      return {
        success: false,
        error: error.message || "Erro ao criar envio",
      };
    }

    const shipment = await createResponse.json();
    const shipmentId = shipment.id;

    // 2. Adicionar ao carrinho e finalizar
    await fetch("https://melhorenvio.com.br/api/v2/me/shipment/checkout", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        orders: [shipmentId],
      }),
    });

    // 3. Gerar etiqueta
    const labelResponse = await fetch(
      "https://melhorenvio.com.br/api/v2/me/shipment/generate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          orders: [shipmentId],
        }),
      }
    );

    if (!labelResponse.ok) {
      const error = await labelResponse.json();
      return {
        success: false,
        error: error.message || "Erro ao gerar etiqueta",
      };
    }

    // 4. Obter URL da etiqueta
    const printResponse = await fetch(
      `https://melhorenvio.com.br/api/v2/me/shipment/print?orders[]=${shipmentId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    const printData = await printResponse.json();

    return {
      success: true,
      trackingCode: shipment.tracking || shipmentId,
      labelUrl: printData.url,
    };
  } catch (error) {
    console.error("❌ Exceção ao gerar etiqueta:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Rastrear encomenda via Correios (API pública)
 */
export async function trackCorreios(trackingCode: string): Promise<{
  status: string;
  events: Array<{
    date: string;
    location: string;
    description: string;
  }>;
}> {
  try {
    // Usando API pública do Correios (requer cadastro)
    const user = process.env.CORREIOS_USER;
    const password = process.env.CORREIOS_PASSWORD;

    if (!user || !password) {
      return {
        status: "Rastreamento indisponível",
        events: [],
      };
    }

    const response = await fetch(
      `https://webservice.correios.com.br/service/rastro?usuario=${user}&senha=${password}&tipo=L&resultado=T&objetos=${trackingCode}`,
      {
        headers: {
          Accept: "application/xml",
        },
      }
    );

    if (!response.ok) {
      return {
        status: "Erro ao rastrear",
        events: [],
      };
    }

    const xml = await response.text();

    // Parse básico do XML (em produção, usar biblioteca xml2js)
    const statusMatch = xml.match(/<status>(.*?)<\/status>/);
    const status = statusMatch ? statusMatch[1] : "Desconhecido";

    return {
      status,
      events: [], // Parsear eventos do XML
    };
  } catch (error) {
    console.error("❌ Erro ao rastrear:", error);
    return {
      status: "Erro",
      events: [],
    };
  }
}

/**
 * Wrapper genérico para gerar etiqueta
 */
export async function generateShippingLabel(
  orderId: string,
  from: ShippingAddress,
  to: ShippingAddress,
  packageInfo: ShippingPackage,
  carrier: "melhor-envio" | "correios" = "melhor-envio"
): Promise<LabelResponse> {
  console.log(`📦 Gerando etiqueta via ${carrier} para pedido ${orderId}...`);

  if (carrier === "melhor-envio") {
    // Primeiro cotar para obter service ID
    const quotes = await quoteMelhorEnvio(
      from.postalCode,
      to.postalCode,
      packageInfo
    );

    if (quotes.length === 0) {
      return {
        success: false,
        error: "Nenhum serviço de envio disponível",
      };
    }

    // Escolher o mais barato (PAC)
    const cheapest = quotes.reduce(
      (min, q) => (q.price < min.price ? q : min),
      quotes[0]
    );

    return await generateMelhorEnvioLabel(
      orderId,
      from,
      to,
      packageInfo,
      cheapest.company.id
    );
  }

  return {
    success: false,
    error: `Provedor ${carrier} não implementado`,
  };
}
