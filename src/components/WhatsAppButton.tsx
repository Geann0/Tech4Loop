"use client";

interface WhatsAppButtonProps {
  productName: string;
  className?: string;
  partnerName: string | null;
  partnerWhatsapp: string | null;
  partnerRegions?: string[] | null; // Adicionado como opcional
}

export default function WhatsAppButton({
  productName,
  className,
  partnerName,
  partnerWhatsapp,
}: WhatsAppButtonProps) {
  // Número de WhatsApp da loja principal (admin)
  const adminPhoneNumber = "5569999999999";

  const handleWhatsAppClick = () => {
    let targetNumber = adminPhoneNumber;

    // Se o produto é de um parceiro e ele tem um número de WhatsApp cadastrado
    if (partnerName && partnerName !== "Tech4Loop" && partnerWhatsapp) {
      targetNumber = partnerWhatsapp;
    }

    const message = `Olá, tenho uma dúvida sobre o produto: ${productName}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${targetNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className={`bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors ${className}`}
    >
      Falar com Vendedor
    </button>
  );
}
