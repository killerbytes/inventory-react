import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import services, { type APIResponse } from "../../services";
import { Toaster } from "@/components/ui/sonner";
import { Pencil } from "lucide-react";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import type { Category } from "../Categories";

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
    limit: 10,
    page: 1,
  });
  const [toggle, handleToggle] = useToggle({
    addModal: false,
    editModal: false,
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await services.productServices.get(filter);
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

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Products</h1>

          <div className="ml-auto">
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </header>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
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

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: string;
  category: Category;
  reorderLevel: number;
}
