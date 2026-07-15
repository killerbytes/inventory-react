import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

import { useCustomersPaginated } from "@/hooks/useCustomers";
import { Customer, filterProps } from "@/schemas";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import { toast } from "sonner";

export default function Customers() {
  const [selected, setSelected] = React.useState<Customer | null>();
  const [filter, setFilter] = React.useState<filterProps>({
    limit: 10,
    page: 1,
    sort: "name",
    order: "ASC",
    q: "",
  });
  const debouncedQuery = useDebounce(filter, 300);

  const { data, isLoading, isError, error } =
    useCustomersPaginated(debouncedQuery);

  const [toggle, handleToggle] = useToggle({
    addModal: false,
    editModal: false,
  });

  React.useEffect(() => {
    if (isError) {
      toast.error(error?.message);
    }
  }, [isError, error]);

  const requestSort = (sort: string) => {
    setFilter((prev) => ({
      ...prev,
      sort,
      order: prev.sort === sort && prev.order === "ASC" ? "DESC" : "ASC",
    }));
  };
  const columns = [
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

  return (
    <>
      <>
        <PageHeader title="Customers">
          <Button
            className="shadow-sm"
            onClick={() => {
              handleToggle({ addModal: true });
            }}
          >
            <Plus /> Add Customer
          </Button>
        </PageHeader>
        <>
          <div>
            <Input
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
              <div className="w-full overflow-auto border shadow rounded-md">
                <Table className="bg-background">
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
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
                      <TableRow key={item.id} className="odd:bg-gray-100">
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
                </Table>
              </div>
              {data && data.meta.totalPages > 1 && (
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
          // cb={getData}
        />
      )}

      {toggle.editModal && (
        <EditModal
          isOpen={true}
          onClose={() => {
            handleToggle({ editModal: false });
          }}
          // cb={getData}
          data={selected as Customer}
        />
      )}
    </>
  );
}
