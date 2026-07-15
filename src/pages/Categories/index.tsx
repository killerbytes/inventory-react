import { ApiErrorResponse, Category } from "@/schemas";
import { hasRole, ROLES } from "@/utils/permissions";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { categoryServices } from "@/services";
import DnDTable from "@/components/DnDTable";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import EditModal from "./EditModal";
import { useStore } from "@/stores";
import AddModal from "./AddModal";
import { toast } from "sonner";
import React from "react";

export default function Categories() {
  const [data, setData] = React.useState<Category[]>([]);
  const { authState } = useStore();
  const [selected, setSelected] = React.useState<Category>();
  const [loading, setLoading] = React.useState(true);
  const [filter] = React.useState({
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
    // {
    //   accessorKey: "subCategories",
    //   header: "Sub Categories",
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex gap-2 justify-start items-center">
    //         {row.original.subCategories?.map((i) => (
    //           <Badge
    //             onClick={() => {
    //               setSelected(i);
    //               handleToggle({ editModal: true });
    //             }}
    //           >
    //             {i.name}
    //           </Badge>
    //         ))}
    //         <Button
    //           variant="outline"
    //           size="icon"
    //           className="size-8"
    //           onClick={() => {
    //             setSelected(row.original);
    //             handleToggle({ addModal: true });
    //           }}
    //           disabled={row.original.subCategories?.length === 0}
    //         >
    //           <Plus />
    //         </Button>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "actions",
      header: "",
      meta: {
        className: "w-10",
      },
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 justify-end">
            {hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER]) && (
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
            )}
            {/* <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ addModal: true });
              }}
            >
              <Plus />
            </Button> */}
          </div>
        );
      },
    },
  ];
  return (
    <>
      <>
        <PageHeader title="Categories">
          {hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER]) && (
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> Add Category
            </Button>
          )}
        </PageHeader>
        <>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="w-full overflow-auto border shadow rounded-md">
              <DnDTable
                className="bg-background"
                columns={columns}
                data={data || []}
                onSubmit={onSubmit}
                disabled={
                  !hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER])
                }
              />
            </div>
          )}
        </>
      </>

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
    </>
  );
}
