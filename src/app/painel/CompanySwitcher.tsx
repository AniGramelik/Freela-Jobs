import type { CompanyOption } from "@/domain/company-context";

export function CompanySwitcher({
  companies,
  activeId,
}: {
  companies: CompanyOption[];
  activeId: string | undefined;
}) {
  if (companies.length <= 1) {
    return <p>Empresa: {companies[0]?.name ?? "—"}</p>;
  }

  return (
    <form action="/contexto" method="post">
      <label>
        Agindo como:{" "}
        <select name="companyId" defaultValue={activeId}>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>{" "}
      <button type="submit">Trocar</button>
    </form>
  );
}
