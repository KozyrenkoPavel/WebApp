"use client";
import { useState } from "react";
import DataTable, { Col } from "./DataTable";
import EntityForm, { Field, Mode } from "./EntityForm";
import Modal from "./Modal";
import { send, useDebounced, useList } from "./hooks";
import { clientSchema } from "@/lib/validation";

type Client = { id: number; name: string; code: string };

const fields: Field[] = [
  { name: "id", label: "ID", type: "text", readOnly: true },
  { name: "name", label: "Название", type: "text", required: true },
  { name: "code", label: "Код", type: "text", required: true },
];

const cols: Col<Client>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Название", sortable: true },
  { key: "code", label: "Код", sortable: true },
];

const titles = {
  view: "Карточка клиента",
  edit: "Редактирование клиента",
  create: "Новый клиент",
};

export default function ClientsView() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("id");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [modal, setModal] = useState<{
    mode: Mode;
    item: Partial<Client>;
  } | null>(null);

  const dName = useDebounced(name);
  const dCode = useDebounced(code);
  const list = useList<Client>("/api/clients", {
    name: dName,
    code: dCode,
    page,
    pageSize,
    sort,
    dir,
  });

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
        ? await send("/api/clients", "POST", data)
        : await send(`/api/clients/${modal!.item.id}`, "PUT", data);

    if (!err) {
      setModal(null);
      list.reload();
    }
    return err;
  }

  async function remove(c: Client) {
    if (!confirm(`Удалить клиента «${c.name}»?`)) return;

    const err = await send(`/api/clients/${c.id}`, "DELETE");

    if (err) alert(err);
    else list.reload();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Справочник клиентов</h1>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ mode: "create", item: {} })}
        >
          Добавить клиента
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="input"
          placeholder="Поиск по названию"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPage(1);
          }}
        />
        <input
          className="input"
          placeholder="Поиск по коду"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setPage(1);
          }}
        />
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
        actions={(c) => (
          <div className="flex justify-end gap-1">
            <button
              className="btn"
              onClick={() => setModal({ mode: "view", item: c })}
            >
              Открыть
            </button>
            <button
              className="btn"
              onClick={() => setModal({ mode: "edit", item: c })}
            >
              Изменить
            </button>
            <button className="btn btn-danger" onClick={() => remove(c)}>
              Удалить
            </button>
          </div>
        )}
      />

      {modal && (
        <Modal title={titles[modal.mode]} onClose={() => setModal(null)}>
          <EntityForm
            fields={fields}
            schema={clientSchema}
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
