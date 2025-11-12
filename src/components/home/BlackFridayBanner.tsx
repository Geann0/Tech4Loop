"use client";

import { siteSettings } from "@/lib/settings";

const BlackFridayBanner = () => {
  if (!siteSettings.isBlackFridayActive) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-electric-purple to-neon-blue py-12 my-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          BLACK FRIDAY TECH4LOOP
        </h2>
        <p className="text-xl text-white mb-6">
          As melhores ofertas do ano estão aqui. Não perca!
        </p>
        <a
          href="/produtos?oferta=black-friday"
          className="bg-background text-white font-bold py-3 px-8 rounded-lg hover:scale-105 transition-transform"
        >
          Ver Ofertas
        </a>
      </div>
    </section>
  );
};

export default BlackFridayBanner;
