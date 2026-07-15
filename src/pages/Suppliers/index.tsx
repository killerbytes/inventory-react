import { useSuppliersPaginated } from "@/features/suppliers/hooks/useSuppliers";
import { PAGINATION, PAGINATION_RESPONSE, ROUTES } from "@/utils/definitions";
import EditModal from "../../features/suppliers/components/EditModal";
import AddModal from "../../features/suppliers/components/AddModal";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { filterProps, Supplier } from "@/schemas";
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function Suppliers() {
  const [selected, setSelected] = React.useState<Supplier | null>();
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
  const { data = PAGINATION_RESPONSE, isLoading } =
    useSuppliersPaginated(filter);

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
    <>
      <>
        <PageHeader title="Suppliers">
          <Button
            className="shadow-sm"
            onClick={() => {
              handleToggle({ addModal: true });
            }}
          >
            <Plus /> Add Supplier
          </Button>
        </PageHeader>
        <>
          <div>
            <Input
              placeholder="Search supplier"
              className="w-full"
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
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <DataTable data={data.data || []} columns={columns} />

              {data.meta.totalPages > 1 && (
                <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
              )}
            </>
          )}
        </>
      </>

      {toggle.addModal && (
        <AddModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addModal: false });
          }}
        />
      )}

      {toggle.editModal && (
        <EditModal
          isOpen={true}
          onClose={() => {
            handleToggle({ editModal: false });
          }}
          data={selected as Supplier}
        />
      )}
    </>
  );
}
