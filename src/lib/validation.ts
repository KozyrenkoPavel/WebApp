import { z } from "zod";

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Минимум 2 символа")
    .max(200, "Максимум 200 символов"),
  code: z
    .string()
    .trim()
    .min(1, "Укажите код")
    .regex(/^[A-Za-z0-9_-]{2,20}$/, "2–20 символов: латиница, цифры, - и _"),
});

export const dealSchema = z.object({
  date: z
    .string()
    .min(1, "Укажите дату")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Формат даты: ГГГГ-ММ-ДД"),
  number: z
    .string()
    .trim()
    .min(1, "Укажите номер")
    .max(50, "Максимум 50 символов"),
  amount: z.coerce
    .number({ invalid_type_error: "Введите число" })
    .positive("Сумма должна быть больше 0")
    .max(999999999999, "Слишком большая сумма")
    .refine(
      (v) => Math.round(v * 100) / 100 === v,
      "Не более 2 знаков после запятой",
    ),
  client_id: z.coerce
    .number({ invalid_type_error: "Выберите клиента" })
    .int()
    .positive("Выберите клиента"),
  description: z.string().trim().max(1000, "Максимум 1000 символов"),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type DealInput = z.infer<typeof dealSchema>;
