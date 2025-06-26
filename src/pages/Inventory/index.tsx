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

  // const columns2 = [
  //   {
  //     title: "ID",
  //     dataIndex: "id",
  //     key: "id",
  //   },
  //   {
  //     title: "Name",
  //     dataIndex: "product.name",
  //     key: "product.name",
  //     className: "w-[50%]",
  //   },
  //   {
  //     title: "Description",
  //     dataIndex: "product.description",
  //     key: "product.description",
  //     className: "w-[50%]",
  //   },
  //   {
  //     title: "Quantity",
  //     dataIndex: "quantity",
  //     key: "quantity",
  //     className: "text-right",
  //   },
  //   {
  //     title: "Reorder Level",
  //     dataIndex: "product.reorderLevel",
  //     key: "product.reorderLevel",
  //     className: "text-right",
  //   },
  //   {
  //     title: "Price",
  //     dataIndex: "price",
  //     key: "price",
  //     className: "text-right",
  //   },
  //   {
  //     title: "Updated At",
  //     dataIndex: "updatedAt",
  //     key: "updatedAt",
  //     className: "text-right",
  //   },
  //   {
  //     dataIndex: "actions",
  //     key: "actions",
  //   },
  // ];

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
      accessorKey: "product.reorderLevel",
      header: () => <div className="text-right">Reorder Level</div>,
      meta: { className: "text-right" },
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      meta: { className: "text-right" },
      cell: ({ row }) => {
        return row.getValue("quantity") <= 0 ? (
          row.getValue("price")
        ) : (
          <EditableCell item={row.original} />
        );
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
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
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
          ></DataTable>

          {/* <Table>
            <TableHeader>
              <TableRow>
                {columns2.map((column) => (
                  <TableHead
                    key={column.key}
                    onClick={() => requestSort(column.key)}
                    style={{ cursor: "pointer" }}
                    title={column.title}
                    className={column.className}
                  >
                    {column.title}
                    {filter.sort === column.key && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {filter.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((item) => (
                <TableRow
                  key={item.id}
                  className={cx("group md:hover:bg-slate-100")}
                >
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="font-medium">
                    {item.product.name}
                  </TableCell>
                  <TableCell>{item.product.description}</TableCell>
                  <TableCell
                    className={cx("text-right", {
                      "text-red-500":
                        item.quantity <= item.product.reorderLevel,
                    })}
                  >
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.product.reorderLevel}
                  </TableCell>
                  <TableCell
                    className={cx("text-right", {
                      "text-red-500": item.price <= 0,
                    })}
                  >
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate(item.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      className="group-hover:opacity-100 md:opacity-0"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelected(item);
                        handleToggle({ editModal: true });
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> */}
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
