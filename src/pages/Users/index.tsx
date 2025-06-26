import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

import { userServices, type APIResponse, type User } from "@/services";
import { Toaster } from "@/components/ui/sonner";
import { PAGINATION } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import EditModal from "./EditModal";
import AddModal from "./AddModal";

export default function Users() {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<APIResponse<User[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [selectedUser, setSelectedUser] = React.useState<User | null>();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "id",
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
      const response = await userServices.getAll(filter);
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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "w-[50%]",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      className: "w-[50%]",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "w-[50%]",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      className: "text-right",
    },
    {
      dataIndex: "actions",
      key: "actions",
    },
  ];

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center px-2">
          <h1 className="text-base font-medium">Users</h1>

          <div className="ml-auto">
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> Add User
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
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
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
              {data?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedUser(user);
                        handleToggle({ editModal: true });
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                  </TableHead>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          data={selectedUser as User}
        />
      )}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
