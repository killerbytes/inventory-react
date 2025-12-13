import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { filterProps, PaginatedResponse, Supplier } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PAGINATION, ROUTES } from "@/utils/definitions";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supplierServices } from "@/services";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import { head } from "lodash";
import React from "react";

export default function Suppliers() {
  const [data, setData] = React.useState<PaginatedResponse<Supplier>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [selected, setSelected] = React.useState<Supplier | null>();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "name",
    order: "ASC",
    q: "",
  });
  const [toggle, handleToggle] = useToggle({
    addModal: false,
    editModal: false,
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await supplierServices.getAll(filter);
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

  const requestSort = (sort: string) => {
    setFilter((prev) => ({
      ...prev,
      sort,
      order: prev.sort === sort && prev.order === "ASC" ? "DESC" : "ASC",
    }));
  };
  const columns2 = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "w-[50%]",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      className: "w-[50%]",
    },
    {
      dataIndex: "actions",
      key: "actions",
    },
  ];
  const columns = React.useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          return (
            <div>
              <Link
                to={ROUTES.SUPPLIERS_DETAILS.replace(":id", row.original.id)}
              >
                {row.original.name}
              </Link>
              <div className="text-xs text-muted-foreground">
                {row.original.address}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row }) => {
          return (
            <div>
              <div>{row.original.contact}</div>
              <div className="text-xs text-muted-foreground">
                {row.original.phone}
              </div>
            </div>
          );
        },
      },
      {
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        accessorKey: "actions",
        header: "",
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ editModal: true });
              }}
            >
              <Pencil size={16} />
            </Button>
          );
        },
      },
    ],
    [],
  );
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Suppliers
          </CardTitle>
          <CardAction>
            <Button
              className="shadow-sm"
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> Add Supplier
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div>
            <Input
              placeholder="Search supplier"
              className="w-full mb-4"
              value={filter.q}
              onChange={(e) => {
                setFilter((prev) => ({
                  ...prev,
                  q: e.target.value,
                  page: 1,
                }));
              }}
            />
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <DataTable data={data.data || []} columns={columns} />

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
                            {filter.order === "ASC" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.name}
                        <p className="text-xs text-muted-foreground">
                          {item.address}
                        </p>
                      </TableCell>
                      <TableCell>
                        {item.contact}
                        <p className="text-xs text-muted-foreground">
                          {item.phone}
                        </p>
                      </TableCell>
                      <TableHead className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelected(item);
                            handleToggle({ editModal: true });
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                      </TableHead>
                    </TableRow>
                  ))}
                </TableBody>
              </Table> */}
              {data.totalPages > 1 && (
                <Pager data={data} filter={filter} setFilter={setFilter} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {toggle.addModal && (
        <AddModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addModal: false });
          }}
          cb={getData}
        />
      )}

      {toggle.editModal && (
        <EditModal
          isOpen={true}
          onClose={() => {
            handleToggle({ editModal: false });
          }}
          cb={getData}
          data={selected as Supplier}
        />
      )}
    </div>
  );
}
