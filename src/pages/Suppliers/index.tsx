import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAGINATION, PAGINATION_RESPONSE, ROUTES } from "@/utils/definitions";
import { filterProps, PaginatedResponse, Supplier } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supplierServices } from "@/services";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import React from "react";

export default function Suppliers() {
  const [data, setData] =
    React.useState<PaginatedResponse<Supplier>>(PAGINATION_RESPONSE);

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

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns = React.useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Name
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          return (
            <div>
              <Link
                className="text-primary"
                to={ROUTES.SUPPLIERS_DETAILS.replace(
                  ":id",
                  String(row.original.id),
                )}
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
    [filter, handleFilterChange, handleToggle],
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

              {data.meta.totalPages > 1 && (
                <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
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
