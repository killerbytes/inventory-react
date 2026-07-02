import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import ProductLookupInput from "@/components/forms/ProductLookupInput";
import { Articles, OCRForm, ocrFormSchema } from "@/schemas";
import GroupedCommandList from "@/components/GroupedCommandList";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatters";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { useOCR } from "../hooks/useSalesOrders";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import React from "react";

export default function OCRModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}) {
  const { mutate: uploadPhoto, data, isPending } = useOCR();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image before uploading
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1500;
        const MAX_HEIGHT = 1500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append("image", blob, file.name || "receipt.jpg");
              uploadPhoto(formData);
            }
          },
          "image/jpeg",
          0.8,
        );
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const form = useForm<OCRForm>({
    resolver: zodResolver(ocrFormSchema),
    defaultValues: {
      receiptNo: "",
      articles: [],
    },
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "articles",
    keyName: "formId",
  });

  const watchArticles = useWatch({
    control: form?.control,
    name: "articles",
  }) as Articles[];

  const tableData = fields.map((field, index) => ({
    ...field,
    ...watchArticles?.[index],
  }));

  React.useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        articles: data.articles.map((item) => ({
          ...item,
          value: item.suggestedProducts?.[0]?.bestMatchCombination,
        })),
      });
    }
  }, [data]);

  const columns = React.useMemo<ColumnDef<Articles>[]>(
    () => [
      {
        accessorKey: "index",
        header: "",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => remove(row.index)}
            variant="outline"
            type="button"
          >
            <Trash2 />
          </Button>
        ),
      },

      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-center",
          className: "text-right min-w-[90px] w-[90px]",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`articles.${row.index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NumberInput {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },
      {
        accessorKey: "value.unit",
        header: "Unit",
        meta: {
          className: "w-15 text-center",
          headerClassName: "text-center",
        },
        cell: ({ row }) => {
          const product = row.original.value;

          return (
            product && (
              <ColorBadge colorMap={UNIT_COLOR}>{product?.unit}</ColorBadge>
            )
          );
        },
      },
      {
        accessorKey: "value.id",
        header: "Product",
        meta: {
          className: "w-[35%]",
        },
        cell: ({ row }) => {
          const data = row.original;
          const combinations = data.suggestedProducts.flatMap(
            (item) => item.combinations,
          );

          return (
            <Controller
              name={`articles.${row.index}.value`}
              control={form.control}
              render={({ field }) => {
                return (
                  <>
                    <FormItem>
                      <FormControl>
                        <ProductLookupInput
                          selected={row.original.value}
                          ariaInvalid={Boolean(
                            form.formState.errors?.articles?.[row.index]?.value,
                          )}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          renderOptions={({ props, options }) => (
                            <>
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup heading="Actual">
                                <CommandItem>{data.article}</CommandItem>
                              </CommandGroup>
                              {data.suggestedProducts?.length > 0 && (
                                <>
                                  <GroupedCommandList
                                    heading="Suggestions"
                                    {...props}
                                    items={combinations}
                                  />

                                  <CommandSeparator />
                                </>
                              )}
                              {options.length > 0 && (
                                <GroupedCommandList
                                  heading="Search"
                                  {...props}
                                  items={options}
                                />
                              )}
                            </>
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  </>
                );
              }}
            />
          );
        },
      },

      {
        accessorKey: "value.price",
        header: "Price",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { value } = row.original;

          return formatCurrency(value?.price || 0);
        },
      },

      {
        accessorKey: "value",
        header: () => <div className="text-right">Amount</div>,
        meta: {
          className: "text-right",
        },
        cell: ({ row }) => {
          const { value, quantity } = row.original;

          const q = Number(quantity);
          const p = Number(value?.price);

          return formatCurrency(q * p || 0);
        },
      },
    ],
    [],
  );

  const handleSubmit = (values: OCRForm) => {
    console.log(values, form.getValues());

    const { receiptNo, articles } = form.getValues();

    const payload = {
      salesOrderNumber: receiptNo,
      status: "DRAFT",
      modeOfPayment: "CASH",
      salesOrderItems: articles.map((item) => {
        return {
          combinationId: item.value?.id,
          combinations: item.value,
          quantity: item.quantity,
          purchasePrice: item.value?.price,
        };
      }),
    };

    localStorage.setItem(
      `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
      JSON.stringify(payload, (_, v) => (v === undefined ? null : v)),
    );

    onSubmit?.();
  };

  return (
    <Modal title="OCR Receipt" isOpen={isOpen} onOpenChange={onClose} size="lg">
      {!data && (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 p-4">
          {isPending ? (
            <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl bg-gray-50 border-gray-300 opacity-70">
              <Loader2 className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
              <p className="text-lg font-semibold text-gray-700">
                Processing...
              </p>
              <p className="text-sm text-gray-500">Extracting receipt data</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row w-full gap-4">
              <label
                htmlFor="camera-input-capture"
                className="flex flex-col items-center justify-center flex-1 h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-gray-300 py-4 md:hidden"
              >
                <Camera className="w-10 h-10 mb-3 text-gray-400" />
                <span className="font-semibold text-gray-600">Take Photo</span>
                <span className="text-sm text-gray-500">Open camera</span>
                <input
                  id="camera-input-capture"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <label
                htmlFor="camera-input-upload"
                className="flex flex-col items-center justify-center flex-1 h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-gray-300 py-4"
              >
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <span className="font-semibold text-gray-600">
                  Upload Image
                </span>
                <span className="text-sm text-gray-500">From gallery</span>
                <input
                  id="camera-input-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>
      )}
      <div className={!data ? "hidden" : "block"}>
        <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4 md:max-h-full">
          <Form {...form}>
            <form className="flex flex-col gap-4 ">
              <div className="flex justify-between">
                <FormField
                  control={form.control}
                  name="receiptNo"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/4">
                      <FormLabel>Receipt No.</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
                <FormField
                  control={form.control}
                  name="articles"
                  render={() => (
                    <FormItem className="w-full mb-4">
                      <FormControl>
                        <DataTable
                          data={tableData}
                          columns={columns}
                          renderFooter={(data) => {
                            const total = data.reduce(
                              (acc, item) =>
                                (acc +=
                                  Number(item.quantity) *
                                    Number(item?.value?.price) || 0),
                              0,
                            );
                            return (
                              <TableRow>
                                <TableCell>Total</TableCell>
                                <TableCell
                                  colSpan={10}
                                  className="text-right font-bold "
                                >
                                  {formatCurrency(total)}
                                </TableCell>
                              </TableRow>
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" className="shadow-sm" onClick={onClose}>
          Cancel
        </Button>
        {data && (
          <Button
            className="shadow-sm bg-green-500"
            type="button"
            onClick={(e) => {
              console.log(form.getValues(), form.formState.errors);

              form.handleSubmit(handleSubmit)(e);
            }}
          >
            Fill Form
          </Button>
        )}
      </DialogFooter>
    </Modal>
  );
}
