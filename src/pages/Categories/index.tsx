import { categoryServices, type APIResponse, type Category } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DnDTable from "@/components/DnDTable";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import React from "react";

export default function Categories() {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<APIResponse<Category[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [selected, setSelected] = React.useState<Category | null>();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: 10,
    page: 1,
    sort: "order",
    order: "asc",
    q: "",
  });
  const [toggle, handleToggle] = useToggle({
    addModal: false,
    editModal: false,
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryServices.getAll(filter);
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

  const onSubmit = async (data: T[]) => {
    const sorted = data.map(({ id }) => {
      return id;
    });
    await categoryServices.updateSort(sorted);
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Name",
      meta: { className: "w-50" },
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 10,
      meta: { className: "!text-wrap" },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Actions</div>,
      meta: {
        className: "w-10",
      },
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ editModal: true });
              }}
            >
              <Pencil />
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Categories</h1>

          <div className="ml-auto">
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> Add Category
            </Button>
          </div>
        </div>
      </header>
      <div>
        <Input
          placeholder="Search products"
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
          <DnDTable
            columns={columns}
            data={data?.data || []}
            onSubmit={onSubmit}
          />

          <Pager data={data} page={page} setPage={setPage} />
        </>
      )}

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
          data={selected as Category}
        />
      )}
    </div>
  );
}
