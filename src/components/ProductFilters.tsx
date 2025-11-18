"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterProps {
  categories: { id: string; name: string }[];
  minPrice?: number;
  maxPrice?: number;
}

export default function ProductFilters({
  categories,
  minPrice = 0,
  maxPrice = 10000,
}: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [condition, setCondition] = useState(
    searchParams.get("condition") || ""
  );
  const [availability, setAvailability] = useState(
    searchParams.get("availability") || ""
  );
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [priceRange, setPriceRange] = useState(
    searchParams.get("priceRange") || ""
  );

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (sortBy) params.set("sort", sortBy);
    if (condition) params.set("condition", condition);
    if (availability) params.set("availability", availability);
    if (location) params.set("location", location);
    if (brand) params.set("brand", brand);
    if (priceRange) params.set("priceRange", priceRange);

    startTransition(() => {
      router.push(`/produtos?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setPriceMin("");
    setPriceMax("");
    setSortBy("");
    setCondition("");
    setAvailability("");
    setLocation("");
    setBrand("");
    setPriceRange("");
    startTransition(() => {
      router.push("/produtos");
    });
  };

  const hasActiveFilters =
    search ||
    selectedCategory ||
    priceMin ||
    priceMax ||
    sortBy ||
    condition ||
    availability ||
    location ||
    brand ||
    priceRange;

  // Faixas de preço predefinidas
  const priceRanges = [
    { label: "Até R$ 100", value: "0-100" },
    { label: "R$ 100 - R$ 300", value: "100-300" },
    { label: "R$ 300 - R$ 500", value: "300-500" },
    { label: "R$ 500 - R$ 1.000", value: "500-1000" },
    { label: "R$ 1.000 - R$ 2.000", value: "1000-2000" },
    { label: "Acima de R$ 2.000", value: "2000-999999" },
  ];

  return (
    <div className="bg-dark-card border border-gray-800 rounded-lg overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">⚡︎</span>
            <span>Filtros de Busca</span>
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm text-red-400 hover:text-red-300 transition-all flex items-center gap-2"
            >
              <span>✕︎</span>
              <span>Limpar tudo</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Campo de Busca Principal */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            ◉ O que você está procurando?
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Ex: Fone Bluetooth, Mouse Gamer, Teclado..."
              className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all text-lg"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
              ◉
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                ✕︎
              </button>
            )}
          </div>
        </div>

        {/* Filtros Rápidos em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              ▣ Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faixa de Preço Rápida */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              $ Faixa de Preço
            </label>
            <select
              value={priceRange}
              onChange={(e) => {
                const value = e.target.value;
                setPriceRange(value);
                if (value) {
                  const [min, max] = value.split("-");
                  setPriceMin(min);
                  setPriceMax(max);
                } else {
                  setPriceMin("");
                  setPriceMax("");
                }
              }}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            >
              <option value="">Qualquer valor</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              ↕︎ Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            >
              <option value="">Mais relevantes</option>
              <option value="price_asc">↓ Menor preço</option>
              <option value="price_desc">↑ Maior preço</option>
              <option value="name_asc">A → Z</option>
              <option value="name_desc">Z → A</option>
              <option value="newest">+ Mais recentes</option>
            </select>
          </div>
        </div>

        {/* Botão Filtros Avançados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full mb-6 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white font-medium transition-all flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span>≡</span>
            <span>Filtros Avançados</span>
          </span>
          <span
            className={`transform transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {/* Filtros Avançados (Expansível) */}
        {showAdvanced && (
          <div className="mb-6 p-6 bg-gray-900/50 border border-gray-700 rounded-lg space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>≡</span>
              <span>Opções Avançadas</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Condição */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ✦ Condição
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
                >
                  <option value="">Todas</option>
                  <option value="new">Novo</option>
                  <option value="used">Usado</option>
                  <option value="refurbished">Recondicionado</option>
                </select>
              </div>

              {/* Disponibilidade */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ☐ Disponibilidade
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
                >
                  <option value="">Todos</option>
                  <option value="in_stock">Em estoque</option>
                  <option value="low_stock">Estoque baixo</option>
                  <option value="pre_order">Pré-venda</option>
                </select>
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ◈ Localização
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
                >
                  <option value="">Todas as regiões</option>
                  <option value="RO">Rondônia</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PR">Paraná</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="RS">Rio Grande do Sul</option>
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ◆ Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Samsung, Apple..."
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
                />
              </div>

              {/* Preço Mínimo Personalizado */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  $ Preço Mínimo
                </label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => {
                    setPriceMin(e.target.value);
                    setPriceRange(""); // Limpa faixa predefinida
                  }}
                  placeholder="R$ 0"
                  min="0"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
                />
              </div>

              {/* Preço Máximo Personalizado */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  $ Preço Máximo
                </label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    setPriceRange(""); // Limpa faixa predefinida
                  }}
                  placeholder="R$ 10.000"
                  min="0"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botão Aplicar */}
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="w-full py-4 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold text-lg rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="animate-spin">◌</span>
              <span>Aplicando Filtros...</span>
            </>
          ) : (
            <>
              <span>◉</span>
              <span>Buscar Produtos</span>
            </>
          )}
        </button>

        {/* Filtros Ativos */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold text-gray-400 mr-2">
                Filtros ativos:
              </span>
              {search && (
                <span className="px-3 py-1 bg-neon-blue/20 border border-neon-blue/50 rounded-full text-sm text-neon-blue flex items-center gap-1">
                  ◉ &quot;{search}&quot;
                  <button
                    onClick={() => setSearch("")}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="px-3 py-1 bg-electric-purple/20 border border-electric-purple/50 rounded-full text-sm text-electric-purple flex items-center gap-1">
                  ▣ {categories.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {priceRange && (
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm text-green-400 flex items-center gap-1">
                  $ {priceRanges.find((r) => r.value === priceRange)?.label}
                  <button
                    onClick={() => {
                      setPriceRange("");
                      setPriceMin("");
                      setPriceMax("");
                    }}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {(priceMin || priceMax) && !priceRange && (
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm text-green-400 flex items-center gap-1">
                  $ R$ {priceMin || "0"} - R$ {priceMax || "∞"}
                  <button
                    onClick={() => {
                      setPriceMin("");
                      setPriceMax("");
                    }}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {condition && (
                <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-sm text-yellow-400 flex items-center gap-1">
                  ✦{" "}
                  {condition === "new"
                    ? "Novo"
                    : condition === "used"
                      ? "Usado"
                      : "Recondicionado"}
                  <button
                    onClick={() => setCondition("")}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {availability && (
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm text-blue-400 flex items-center gap-1">
                  ☐{" "}
                  {availability === "in_stock"
                    ? "Em estoque"
                    : availability === "low_stock"
                      ? "Estoque baixo"
                      : "Pré-venda"}
                  <button
                    onClick={() => setAvailability("")}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {location && (
                <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/50 rounded-full text-sm text-pink-400 flex items-center gap-1">
                  ◈ {location}
                  <button
                    onClick={() => setLocation("")}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {brand && (
                <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full text-sm text-orange-400 flex items-center gap-1">
                  ◆ {brand}
                  <button
                    onClick={() => setBrand("")}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
              {sortBy && (
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-sm text-cyan-400 flex items-center gap-1">
                  ↕︎{" "}
                  {
                    {
                      price_asc: "Menor preço",
                      price_desc: "Maior preço",
                      name_asc: "A-Z",
                      name_desc: "Z-A",
                      newest: "Mais recentes",
                    }[sortBy]
                  }
                  <button
                    onClick={() => setSortBy("")}
                    className="hover:text-white"
                  >
                    ✕︎
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
