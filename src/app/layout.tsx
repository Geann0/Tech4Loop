import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/CustomerHeader";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { CartProvider } from "@/contexts/CartContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tech4Loop - Conecte-se na estrada",
  description:
    "Acessórios tech de qualidade para o seu dia a dia e suas viagens.",
  keywords: "intercomunicador, moto, tech, acessórios, bluetooth, capacete",
  authors: [{ name: "Tech4Loop" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Tech4Loop",
    title: "Tech4Loop - Conecte-se na estrada",
    description:
      "Acessórios tech de qualidade para o seu dia a dia e suas viagens.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech4Loop - Conecte-se na estrada",
    description:
      "Acessórios tech de qualidade para o seu dia a dia e suas viagens.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={poppins.className}>
        <CartProvider>
          <Header />
          <main className="pt-20">{children}</main>
          <Footer />
          <Analytics />
        </CartProvider>
      </body>
    </html>
  );
}
