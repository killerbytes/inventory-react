import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiErrorResponse, Category, PaginatedResponse } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/utils";
import { categoryServices } from "@/services";
import DnDTable from "@/components/DnDTable";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import { toast } from "sonner";
import React from "react";

export default function Categories() {
  const [data, setData] = React.useState<PaginatedResponse<Category[]>>({
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
      const data = await categoryServices.getAll({});
      setData(data);
    } catch (error) {
      const { message } = getErrorMessage(error as ApiErrorResponse);
      toast.error("Submission failed: " + message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getData();
  }, [filter, getData]);

  const onSubmit = async (data: Category[]) => {
    const sorted = data.map(({ id }) => {
      return String(id);
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
      accessorKey: "subCategories",
      header: "Sub Categories",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 justify-start items-center">
            {row.original.subCategories?.map((i) => (
              <Badge
                onClick={() => {
                  setSelected(i);
                  handleToggle({ editModal: true });
                }}
              >
                {i.name}
              </Badge>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ addModal: true });
              }}
              disabled={row.original.subCategories?.length === 0}
            >
              <Plus />
            </Button>
          </div>
        );
      },
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
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ addModal: true });
              }}
            >
              <Plus />
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Categories
          </CardTitle>
          <CardAction>
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> Add Category
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
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
                data={data || []}
                onSubmit={onSubmit}
              />
            </>
          )}
        </CardContent>
      </Card>

      {toggle.addModal && (
        <AddModal
          isOpen={true}
          selected={selected}
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
