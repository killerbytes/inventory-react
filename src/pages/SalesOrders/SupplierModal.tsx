import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import validations from "@/utils/validations";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import services from "@/services";
import type { Supplier } from "../Suppliers";
import React, { useCallback, useContext } from "react";
import { GlobalContext } from "@/components/GlobalContext";
import useDebounce from "@/hooks/useDebounce";

export default function SupplierModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Supplier) => void;
}) {
  const { store, fetchData } = useContext(GlobalContext) || {};
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const { supplierSchema } = validations;
  const schema = supplierSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  const query = form.watch("name");
  const debouncedQuery = useDebounce(query, 500);

  const filterSuppliers = useCallback(() => {
    const suppliersArray = Array.isArray(store?.suppliers)
      ? store.suppliers
      : [];
    const filteredSuppliers = suppliersArray.filter((supplier) => {
      return supplier.name.toLowerCase().includes(debouncedQuery.toLowerCase());
    });
    setSuppliers(filteredSuppliers);
  }, [debouncedQuery, store?.suppliers]);

  React.useEffect(() => {
    filterSuppliers();
  }, [filterSuppliers, debouncedQuery]);

  React.useEffect(() => {
    if (fetchData) {
      fetchData("suppliers", async () => {
        const { data } = await services.supplierServices.list();
        return data;
      });
    }
  }, [fetchData]);

  React.useEffect(() => {
    if (store?.suppliers) {
      setSuppliers(store.suppliers as Supplier[]);
    }
  }, [store?.suppliers]);

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} title="Search Supplier">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form
                .handleSubmit((values) => {
                  onSubmit(values as Supplier);
                })(e)
                .catch((error) => {
                  console.error("Form submission error:", error);
                });
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="overflow-auto h-96">
              <ul>
                {suppliers.map((supplier) => (
                  <li key={supplier.id}>
                    <button
                      type="button"
                      className="w-full text-left hover:bg-muted-foreground/20 p-2 rounded-md"
                      onClick={() => {
                        onSubmit(supplier);
                        onClose();
                      }}
                    >
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {supplier.address}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
    </>
  );
}
