import React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAGINATION, PAGINATION_RESPONSE } from "@/utils/definitions";
import { filterProps, PaginatedResponse, User } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import { userServices } from "@/services";
import Pager from "@/components/Pager";
import EditModal from "./EditModal";
import AddModal from "./AddModal";

export default function Users() {
  const [data, setData] =
    React.useState<PaginatedResponse<User>>(PAGINATION_RESPONSE);
  const [selectedUser, setSelectedUser] = React.useState<User>();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "id",
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
      const data = await userServices.getAll(filter);
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

  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => {
              setSelectedUser(row.original);
              handleToggle({ editModal: true });
            }}
            variant="outline"
          >
            <Pencil size={16} />
          </Button>
        ),
      },
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
        meta: {
          className: "w-50",
        },
      },
      {
        accessorKey: "username",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Username
            </ColumnSort>
          );
        },
        meta: {
          className: "w-50",
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Email
            </ColumnSort>
          );
        },
        meta: {
          className: "w-50",
        },
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Active
            </ColumnSort>
          );
        },
        meta: {
          className: "w-50",
        },
        cell: ({ row }) => {
          return (
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
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
            Users
          </CardTitle>
          <CardAction>
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> New User
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
              <DataTable data={data?.data || []} columns={columns} />
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
          data={selectedUser as User}
        />
      )}
    </div>
  );
}
