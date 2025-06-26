import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

import { productServices, type APIResponse, type Product } from "@/services";
import { PAGINATION } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import EditModal from "./EditModal";
import AddModal from "./AddModal";

export default function Products() {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<APIResponse<Product[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [selected, setSelected] = React.useState<Product | null>();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "name",
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
      const response = await productServices.getAll(filter);
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "w-[50%]",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      className: "w-[50%]",
    },
    {
      title: "Category",
      dataIndex: "category.name",
      key: "category.name",
    },
    {
      title: "Reorder Level",
      dataIndex: "reorderLevel",
      key: "reorderLevel",
      className: "text-right",
    },
    {
      dataIndex: "actions",
      key: "actions",
    },
  ];

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center px-2">
          <h1 className="scroll-m-20 font-semibold tracking-tight">Products</h1>
          <div className="ml-auto">
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> Add Product
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
              {data?.data.map((item) => (
                <TableRow key={item.id} className="group md:hover:bg-slate-100">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell className="text-right">
                    {item.reorderLevel}
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
          data={selected as Product}
        />
      )}
    </div>
  );
}
