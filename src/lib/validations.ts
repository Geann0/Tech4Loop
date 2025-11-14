import { z } from "zod";

// Schema para validação de CEP brasileiro
const cepRegex = /^\d{5}-?\d{3}$/;

// Schema para validação de telefone brasileiro
const phoneRegex = /^\(?([1-9]{2})\)?[ ]?([9]{1})?[ ]?([0-9]{4})-?([0-9]{4})$/;

// Schema para validação de email
const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido")
  .toLowerCase()
  .trim();

// Schemas de Checkout
export const checkoutFormSchema = z.object({
  productId: z.string().uuid("ID do produto inválido"),
  productName: z.string().min(1, "Nome do produto é obrigatório"),
  productPrice: z.number().positive("Preço deve ser positivo"),
  productSlug: z.string().min(1, "Slug do produto é obrigatório"),
  partnerName: z.string().optional(),
  partnerRegions: z.string().optional(),
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  email: emailSchema,
  phone: z
    .string()
    .regex(phoneRegex, "Telefone inválido. Use o formato: (11) 99999-9999")
    .transform((val) => val.replace(/\D/g, "")),
  cep: z
    .string()
    .regex(cepRegex, "CEP inválido. Use o formato: 12345-678")
    .transform((val) => val.replace(/\D/g, "")),
  address: z
    .string()
    .min(5, "Endereço deve ter pelo menos 5 caracteres")
    .max(200, "Endereço muito longo")
    .trim(),
  city: z
    .string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres")
    .max(100, "Cidade muito longa")
    .trim(),
  state: z
    .string()
    .length(2, "Estado deve ter 2 letras (UF)")
    .toUpperCase()
    .trim(),
  couponCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Schemas de Produto
export const productFormSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(200, "Nome muito longo")
    .trim(),
  price: z
    .number()
    .positive("Preço deve ser positivo")
    .max(1000000, "Preço muito alto"),
  old_price: z.number().positive().optional().nullable(),
  category_id: z.string().uuid("ID da categoria inválido"),
  short_description: z
    .string()
    .min(10, "Descrição curta deve ter pelo menos 10 caracteres")
    .max(300, "Descrição curta muito longa")
    .trim(),
  description: z
    .string()
    .min(20, "Descrição deve ter pelo menos 20 caracteres")
    .max(5000, "Descrição muito longa")
    .trim(),
  stock: z
    .number()
    .int("Estoque deve ser um número inteiro")
    .min(0, "Estoque não pode ser negativo"),
  technical_specs: z.record(z.string()).optional().nullable(),
  box_contents: z.array(z.string()).optional().nullable(),
  is_featured: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Schema de Parceiro
export const partnerFormSchema = z.object({
  partner_name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha muito longa")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
    ),
  whatsapp_number: z
    .string()
    .regex(phoneRegex, "WhatsApp inválido")
    .optional()
    .nullable()
    .transform((val) => (val ? val.replace(/\D/g, "") : null)),
  service_regions: z
    .array(z.string().length(2, "Estado deve ter 2 letras"))
    .min(1, "Selecione pelo menos uma região de atendimento")
    .transform((regions) => regions.map((r) => r.toUpperCase())),
});

export type PartnerFormData = z.infer<typeof partnerFormSchema>;

// Schema de Categoria
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(100, "Slug muito longo")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    )
    .trim(),
  description: z
    .string()
    .max(500, "Descrição muito longa")
    .optional()
    .nullable(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// Schema de Login
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// Schema de Atualização de Perfil
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  whatsappNumber: z
    .string()
    .regex(phoneRegex, "WhatsApp inválido")
    .transform((val) => val.replace(/\D/g, "")),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Schema de Review/Avaliação
export const reviewFormSchema = z.object({
  product_id: z.string().uuid("ID do produto inválido"),
  rating: z
    .number()
    .int()
    .min(1, "Avaliação mínima é 1")
    .max(5, "Avaliação máxima é 5"),
  comment: z
    .string()
    .min(10, "Comentário deve ter pelo menos 10 caracteres")
    .max(1000, "Comentário muito longo")
    .trim()
    .optional()
    .nullable(),
  user_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100)
    .trim(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

// Schema de Cupom
export const couponFormSchema = z.object({
  code: z
    .string()
    .min(3, "Código deve ter pelo menos 3 caracteres")
    .max(20, "Código muito longo")
    .toUpperCase()
    .regex(/^[A-Z0-9]+$/, "Código deve conter apenas letras e números")
    .trim(),
  description: z.string().max(200).optional().nullable(),
  discount_type: z.enum(["percentage", "fixed", "free_shipping"], {
    errorMap: () => ({ message: "Tipo de desconto inválido" }),
  }),
  discount_value: z.number().positive("Valor do desconto deve ser positivo"),
  min_purchase_amount: z.number().positive().optional().nullable(),
  max_discount_amount: z.number().positive().optional().nullable(),
  valid_from: z.string().datetime("Data inicial inválida"),
  valid_until: z.string().datetime("Data final inválida"),
  usage_limit: z.number().int().positive().optional().nullable(),
});

export type CouponFormData = z.infer<typeof couponFormSchema>;

// Schema de Validação de Cupom
export const validateCouponSchema = z.object({
  code: z.string().min(1, "Código do cupom é obrigatório").toUpperCase().trim(),
  cart_total: z.number().positive("Total do carrinho inválido"),
});

// Helper function para validar dados
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });

  return { success: false, errors };
}
