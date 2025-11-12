import React from "react";

// Tipagem simplificada para o e-mail
interface OrderDetails {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_cep: string;
  products: {
    name: string;
    price: number;
  };
}

interface EmailProps {
  order: OrderDetails;
}

const NewOrderEmail: React.FC<EmailProps> = ({ order }) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    customer_city,
    customer_state,
    customer_cep,
    products,
  } = order;

  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ color: "#00D1FF" }}>🎉 Novo Pedido Recebido!</h1>
      <p>
        Você recebeu um novo pedido para o produto:{" "}
        <strong>{products.name}</strong>.
      </p>

      <h2 style={{ borderBottom: "1px solid #333", paddingBottom: "5px" }}>
        Detalhes do Pedido
      </h2>
      <ul>
        <li>
          <strong>Produto:</strong> {products.name}
        </li>
        <li>
          <strong>Preço:</strong> R$ {products.price.toFixed(2)}
        </li>
        <li>
          <strong>Quantidade:</strong> 1
        </li>
        <li>
          <strong>Total:</strong> R$ {products.price.toFixed(2)}
        </li>
      </ul>

      <h2 style={{ borderBottom: "1px solid #333", paddingBottom: "5px" }}>
        Informações do Cliente
      </h2>
      <ul>
        <li>
          <strong>Nome:</strong> {customer_name}
        </li>
        <li>
          <strong>Email:</strong> {customer_email}
        </li>
        <li>
          <strong>Telefone:</strong> {customer_phone}
        </li>
      </ul>

      <h2 style={{ borderBottom: "1px solid #333", paddingBottom: "5px" }}>
        Endereço de Entrega
      </h2>
      <p>
        {customer_address}
        <br />
        {customer_city}, {customer_state}
        <br />
        CEP: {customer_cep}
      </p>

      <p>
        Por favor, entre em contato com o cliente para combinar os detalhes da
        entrega.
      </p>
    </div>
  );
};

export default NewOrderEmail;
