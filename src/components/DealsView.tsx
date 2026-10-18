"use client";
import { useEffect, useMemo, useState } from "react";
import DataTable, { Col } from "./DataTable";
import EntityForm, { Field, Mode } from "./EntityForm";
import Modal from "./Modal";
import { send, useDebounced, useList } from "./hooks";
import { dealSchema } from "@/lib/validation";

type Deal = {
  id: number;
  date: string;
  number: string;
  amount: number;
  client_id: number;
  client_name: string;
  description: string;
};

type ClientOpt = { id: number; name: string; code: string };

const year = new Date().getFullYear();

const money = (v: number) =>
  v.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const titles = {
  view: "Карточка сделки",
  edit: "Редактирование сделки",
  create: "Новая сделка",
};

const cols: Col<Deal>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "date", label: "Дата", sortable: true },
  { key: "number", label: "Номер", sortable: true },
  {
    key: "amount",
    label: "Сумма",
    sortable: true,
    align: "right",
    render: (r) => money(r.amount),
  },
  { key: "client_name", label: "Клиент", sortable: true },
  { key: "description", label: "Описание", sortable: true },
];

export default function DealsView() {
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(`${year}-12-31`);
  const [number, setNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [modal, setModal] = useState<{
    mode: Mode;
    item: Partial<Deal>;
  } | null>(null);
  const [clients, setClients] = useState<ClientOpt[]>([]);

  useEffect(() => {
    fetch("/api/clients?all=1")
      .then((res) => res.json())
      .then((data) => setClients(data.rows ?? []));
  }, []);

  const dNumber = useDebounced(number);

  const list = useList<Deal>("/api/deals", {
    date_from: from,
    date_to: to,
    number: dNumber,
    client_id: clientId,
    page,
    pageSize,
    sort,
    dir,
  });

  const options = useMemo(
    () => clients.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
    [clients],
  );

  const fields: Field[] = [
    { name: "id", label: "ID", type: "text", readOnly: true },
    { name: "date", label: "Дата", type: "date", required: true },
    { name: "number", label: "Номер", type: "text", required: true },
    { name: "amount", label: "Сумма", type: "number", required: true },
    {
      name: "client_id",
      label: "Клиент",
      type: "select",
      required: true,
      options,
    },
    { name: "description", label: "Описание", type: "textarea" },
  ];

  function onSort(key: string) {
    if (key === sort) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDir("asc");
    }

    setPage(1);
  }

  async function save(data: unknown) {
    const err =
      modal!.mode === "create"
        ? await send("/api/deals", "POST", data)
        : await send(`/api/deals/${modal!.item.id}`, "PUT", data);

    if (!err) {
      setModal(null);
      list.reload();
    }

    return err;
  }

  async function remove(d: Deal) {
    if (!confirm(`Удалить сделку ${d.number}?`)) return;

    const err = await send(`/api/deals/${d.id}`, "DELETE");

    if (err) alert(err);
    else list.reload();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Реестр сделок</h1>
        <button
          className="btn btn-primary"
          onClick={() =>
            setModal({
              mode: "create",
              item: { date: new Date().toISOString().slice(0, 10) },
            })
          }
        >
          Добавить сделку
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          Период с
          <input
            type="date"
            required
            className="input mt-1"
            value={from}
            max={to}
            onChange={(e) => {
              if (e.target.value) {
                setFrom(e.target.value);
                setPage(1);
              }
            }}
          />
        </label>
        <label className="text-sm">
          по
          <input
            type="date"
            required
            className="input mt-1"
            value={to}
            min={from}
            onChange={(e) => {
              if (e.target.value) {
                setTo(e.target.value);
                setPage(1);
              }
            }}
          />
        </label>
        <label className="text-sm">
          Номер
          <input
            className="input mt-1"
            placeholder="Поиск по номеру"
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-sm">
          Клиент
          <select
            className="input mt-1"
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Все клиенты</option>

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataTable
        cols={cols}
        rows={list.rows}
        total={list.total}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        loading={list.loading}
        error={list.error}
        onSort={onSort}
        onPage={setPage}
        onPageSize={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        actions={(data) => (
          <div className="flex justify-end gap-1">
            <button
              className="btn"
              onClick={() => setModal({ mode: "view", item: data })}
            >
              Открыть
            </button>
            <button
              className="btn"
              onClick={() => setModal({ mode: "edit", item: data })}
            >
              Изменить
            </button>
            <button className="btn btn-danger" onClick={() => remove(data)}>
              Удалить
            </button>
          </div>
        )}
      />

      {modal && (
        <Modal title={titles[modal.mode]} onClose={() => setModal(null)}>
          <EntityForm
            fields={fields}
            schema={dealSchema}
            initial={modal.item}
            mode={modal.mode}
            onSubmit={save}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </section>
  );
}
