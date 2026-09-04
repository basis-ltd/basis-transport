import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Table from "./Table";
import type { AppColumnDef } from "./tableFeatures";

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Grace" },
  { id: "3", name: "Katherine" },
];

const columns: AppColumnDef<Row>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
];

const bodyRows = () =>
  screen.getAllByRole("row").filter((row) => row.querySelector("td"));

describe("Table on TanStack Table v9", () => {
  it("paginates client-side when no server callbacks are given", () => {
    render(
      <Table columns={columns} data={rows} size={2} showPagination={false} />,
    );
    const names = bodyRows().map((row) =>
      within(row).getAllByRole("cell")[1].textContent,
    );
    expect(names).toEqual(["Ada", "Grace"]);
  });

  it("passes server pages through untouched under manual pagination", () => {
    // UsersPage drives page/size from the server. If the v9 paginated row
    // model sliced these rows client-side, pageIndex 2 of a 3-row page
    // would render zero rows.
    render(
      <Table
        columns={columns}
        data={rows}
        manualPagination
        page={2}
        size={10}
        showPagination={false}
      />,
    );
    const names = bodyRows().map((row) =>
      within(row).getAllByRole("cell")[1].textContent,
    );
    expect(names).toEqual(["Ada", "Grace", "Katherine"]);
  });

  it("renders loading and empty states", () => {
    const { unmount } = render(
      <Table columns={columns} data={[]} isLoading showPagination={false} />,
    );
    expect(document.querySelectorAll("tbody tr").length).toBeGreaterThan(0);
    unmount();
    render(
      <Table
        columns={columns}
        data={[]}
        showPagination={false}
        noDataMessage="Nothing here."
      />,
    );
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });
});
