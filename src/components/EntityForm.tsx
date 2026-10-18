"use client";
import { useState } from "react";
import type { ZodTypeAny } from "zod";

export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  options?: { value: string | number; label: string }[];
  readOnly?: boolean;
};

export type Mode = "view" | "edit" | "create";

export default function EntityForm({
  fields,
  schema,
  initial,
  mode,
  onSubmit,
  onCancel,
}: {
  fields: Field[];
  schema: ZodTypeAny;
  initial: Record<string, unknown>;
  mode: Mode;
  onSubmit: (data: any) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      fields.map((f) => [f.name, String(initial[f.name] ?? "")]),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const view = mode === "view";

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      const errs: Record<string, string> = {};

      for (const i of parsed.error.issues) {
        errs[String(i.path[0])] ??= i.message;
      }

      setErrors(errs);
      return;
    }

    setErrors({});
    setBusy(true);
    setServerError((await onSubmit(parsed.data)) ?? "");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      {fields.map((f) => {
        const common = {
          id: f.name,
          value: values[f.name],
          disabled: view || f.readOnly,
          className: "input mt-1",
          onChange: (e: React.ChangeEvent<any>) =>
            setValues({ ...values, [f.name]: e.target.value }),
        };
        if (mode === "create" && f.readOnly) return null;
        return (
          <div key={f.name}>
            <label htmlFor={f.name} className="text-sm">
              {f.label}
              {f.required && <span className="text-red-600"> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea rows={3} {...common} />
            ) : f.type === "select" ? (
              <select {...common}>
                <option value="">— выберите —</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type}
                step={f.type === "number" ? "0.01" : undefined}
                {...common}
              />
            )}
            {errors[f.name] && (
              <p className="mt-1 text-xs text-red-600">{errors[f.name]}</p>
            )}
          </div>
        );
      })}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn" onClick={onCancel}>
          {view ? "Закрыть" : "Отмена"}
        </button>

        {!view && (
          <button disabled={busy} className="btn btn-primary">
            {busy ? "Сохраняем…" : "Сохранить"}
          </button>
        )}
      </div>
    </form>
  );
}
