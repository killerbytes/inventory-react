import React from "react";

import {
  inventoryServices,
  type APIResponse,
  type Inventory,
} from "@/services";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PAGINATION, ROUTES } from "@/utils/definitions";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import EditModal from "./EditModal";

export default function Inventory() {
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Inventory | null>();
  const [data, setData] = React.useState<APIResponse<Inventory[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "product.name",
    order: "asc",
    q: "",
  });
  const [toggle, handleToggle] = useToggle({
    editModal: false,
  });
  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryServices.getAll(filter);
      const data = response.data;
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [filter, getData]);

  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  }, [page]);

  const requestSort = (sort: string) => {
    setFilter((prev) => ({
      ...prev,
      sort,
      order: prev.sort === sort && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const EditableCell = ({ item }) => {
    return (
      <div
        onClick={() => {
          setSelected(item);
          handleToggle({ editModal: true });
        }}
        className={cx("bg-gray-200 cursor-pointer", {
          "text-red-500": item.price <= 0,
        })}
      >
        {formatCurrency(item.price)}
      </div>
    );
  };

  const columns: ColumnDef<Inventory>[] = [
    {
      accessorKey: "product.name",
      header: "Product",
    },
    {
      accessorKey: "product.description",
      header: "Description",
    },
    {
      accessorKey: "product.reorderLevel",
      header: () => <div className="text-right">Reorder Level</div>,
      meta: { className: "text-right" },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantity</div>,
      meta: {
        className: "text-right",
      },
      cell: ({ row }) => (
        <div
          className={cx({
            "text-red-500":
              row.original.quantity <= row.original.product.reorderLevel,
          })}
        >
          {row.getValue("quantity")}
        </div>
      ),
    },
    {
      accessorKey: "product.unit",
      header: "Unit",
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      meta: { className: "text-right" },

      cell: ({ row }) => {
        //   return row.getValue("quantity") <= 0 ? (
        //     row.getValue("price")
        //   ) : (
        return <EditableCell item={row.original} />;
        //   );
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => <div className="text-right">Updated At</div>,
      meta: { className: "text-right" },
      cell: ({ row }) => formatDate(row.getValue("updatedAt")),
    },
  ];

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Inventory</h1>
        </div>
        <Link to={ROUTES.INVENTORY_TRANSACTIONS}>
          <Button variant="outline">History</Button>
        </Link>
      </header>
      <div>
        <Input
          placeholder="Search inventory"
          className="w-full mb-4"
          value={filter.q}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              q: e.target.value,
            }));
          }}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataTable
            data={data?.data || []}
            columns={columns}
            className="mb-8"
          />

          <Pager data={data} page={page} setPage={setPage} />
        </>
      )}
      {toggle.editModal && (
        <EditModal
          isOpen={true}
          onClose={() => {
            handleToggle({ editModal: false });
          }}
          cb={getData}
          data={selected as Inventory}
        />
      )}
    </div>
  );
}
