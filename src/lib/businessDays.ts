/**
 * Utilitários para cálculo de dias úteis
 * Exclui sábados, domingos e feriados nacionais brasileiros
 */

// Feriados nacionais fixos (mês começa em 1)
const FIXED_HOLIDAYS = [
  { month: 1, day: 1 }, // Ano Novo
  { month: 4, day: 21 }, // Tiradentes
  { month: 5, day: 1 }, // Dia do Trabalho
  { month: 9, day: 7 }, // Independência
  { month: 10, day: 12 }, // Nossa Senhora Aparecida
  { month: 11, day: 2 }, // Finados
  { month: 11, day: 15 }, // Proclamação da República
  { month: 12, day: 25 }, // Natal
];

/**
 * Verifica se uma data é feriado nacional
 */
function isNationalHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return FIXED_HOLIDAYS.some(
    (holiday) => holiday.month === month && holiday.day === day
  );
}

/**
 * Verifica se uma data é fim de semana
 */
function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Domingo ou Sábado
}

/**
 * Verifica se uma data é dia útil
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isNationalHoliday(date);
}

/**
 * Adiciona dias úteis a uma data
 * @param startDate Data inicial
 * @param businessDaysToAdd Número de dias úteis a adicionar
 * @returns Nova data com os dias úteis adicionados
 */
export function addBusinessDays(
  startDate: Date,
  businessDaysToAdd: number
): Date {
  let currentDate = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDaysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (isBusinessDay(currentDate)) {
      daysAdded++;
    }
  }

  return currentDate;
}

/**
 * Calcula a data de expiração para um pedido de boleto
 * (3 dias úteis a partir da data de criação)
 */
export function calculateBoletoExpirationDate(createdAt: Date): Date {
  return addBusinessDays(createdAt, 3);
}

/**
 * Verifica se um pedido expirou
 */
export function isOrderExpired(
  createdAt: Date,
  paymentMethod: string
): boolean {
  if (paymentMethod !== "boleto" && paymentMethod !== "bank_slip") {
    return false; // Outros métodos não expiram
  }

  const now = new Date();
  const expirationDate = calculateBoletoExpirationDate(createdAt);

  return now > expirationDate;
}

/**
 * Formata data para exibição brasileira
 */
export function formatBrazilianDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
