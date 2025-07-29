import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MODE_OF_PAYMENT,
  MODE_OF_PAYMENT_OPTIONS,
  UNIT_OPTIONS,
} from "@/utils/definitions";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  inventoryServices,
  PurchaseOrder,
  PurchaseOrderItem,
} from "@/services";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { createColumnHelper } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import Select from "@/components/Select";
import React, { useMemo } from "react";

export default function Test() {
  const [value, setValue] = React.useState<string | null>(2);
  React.useEffect(() => {
    const getData = async () => {
      const response = await inventoryServices.list();
      console.log(response);
    };
    getData();
  }, []);

  const form = useForm<PurchaseOrder>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      purchaseOrderNumber: "123123123",
      supplierId: 1,
      modeOfPayment: MODE_OF_PAYMENT_OPTIONS[0].value,
      orderDate: new Date().toISOString(),
      deliveryDate: new Date().toISOString(),

      purchaseOrderItems: [
        { productId: 1, unit: "BOX", unitPrice: 1, quantity: 20 },
      ],
    },
  });
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseOrderItems",
  });

  const onSubmit = (values: PurchaseOrder) => {
    console.log(values);
  };

  const columnHelper = createColumnHelper<PurchaseOrderItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor((_, idx) => idx, {
        id: "index",
        header: "#",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("unitPrice", {
        header: "Unit Price",
        cell: ({ row }) => (
          <input
            {...register(`purchaseOrderItems.${row.index}.unitPrice`, {
              valueAsNumber: true,
            })}
            className="border px-2"
          />
        ),
      }),
      columnHelper.accessor("unit", {
        header: "Unit",
        cell: ({ row }) => {
          const index = row.index;

          return (
            <Controller
              name={`purchaseOrderItems.${row.index}.unit`}
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={UNIT_OPTIONS}
                />
              )}
            />
          );
        },
        xxxcell: ({ row }) => (
          <Select
            {...register(`purchaseOrderItems.${row.index}.unit`)}
            value={row.getValue("unit")}
          >
            {/* <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BOX">Box</SelectItem>
              <SelectItem value="BAG">Bag</SelectItem>
              <SelectItem value="GAL">Gal</SelectItem>
            </SelectContent> */}
          </Select>

          // <select
          //   {...register(`purchaseOrderItems.${row.index}.unit`)}
          //   onChange={(e) => console.log(e.target.name)}
          //   className="border px-2"
          // >
          //   <option value="BOX">Box</option>
          //   <option value="BAG">Bag</option>
          //   <option value="GAL">Gal</option>
          //   <option value="PACK">Pack</option>
          //   <option value="SET">Set</option>
          //   <option value="PCS">Pcs</option>
          // </select>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: ({ row }) => (
          <input
            // type="number"
            {...register(`purchaseOrderItems.${row.index}.quantity`, {
              valueAsNumber: true,
            })}
            className="border px-2 w-16"
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => remove(row.index)}
            className="text-red-500"
          >
            Delete
          </button>
        ),
      }),
    ],
    [register, remove],
  );

  const data = useWatch({
    control,
    name: "purchaseOrderItems",
  });

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const options = [
    { id: "1", name: "Box" },
    { id: "2", name: "Bag" },
    { id: "3", name: "Gal" },
    { id: "4", name: "Pack" },
    { id: "5", name: "Set" },
    { id: "6", name: "Pcs" },
  ];

  return (
    <>
      <Select
        options={categories}
        onChange={(e) => {
          const { value }: { value: string } = e.target;
          setValue(value);
        }}
        value={String(value)}
        valueKey="id"
        labelKey="name"
      ></Select>
    </>
  );
}

const categories = [
  {
    id: 5,
    name: "Plumbing",
    description:
      "Water systems components including pipes, fittings, water heaters, faucets, sinks, sump pumps, and toilets",
    order: 0,
  },
  {
    id: 6,
    name: "Electrical",
    description:
      "Power and lighting systems with wiring, breakers, switches, outlets, lighting fixtures, ceiling fans, and generators",
    order: 1,
  },
  {
    id: 7,
    name: "Flooring",
    description:
      "Surface coverings like carpet, hardwood, laminate, vinyl, tile, underlayment, and area rugs",
    order: 2,
  },
  {
    id: 8,
    name: "Kitchen & Bath",
    description:
      "Renovation essentials including cabinets, countertops, sinks, faucets, vanities, bathtubs, showers, and toilets",
    order: 3,
  },
  {
    id: 9,
    name: "Doors & Windows",
    description:
      "Interior/exterior doors, various window types, and garage doors for entryways and natural light",
    order: 4,
  },
  {
    id: 10,
    name: "Garden Center",
    description:
      "Plants (trees/shrubs/flowers), soil, mulch, fertilizer, gardening tools, and pest control for landscaping",
    order: 5,
  },
  {
    id: 1,
    name: "Building Materials",
    description:
      "Foundation materials including lumber, plywood, concrete, roofing, siding, insulation, drywall, and fencing",
    order: 6,
  },
  {
    id: 2,
    name: "Hardware",
    description:
      "Essential small parts like fasteners (nails, screws), tools accessories, door/window/cabinet hardware, chains, and electrical boxes",
    order: 7,
  },
  {
    id: 3,
    name: "Paint & Supplies",
    description:
      "Interior/exterior paint, stains, spray paint, brushes, rollers, tape, wallpaper, and painting preparation materials",
    order: 8,
  },
  {
    id: 4,
    name: "Tools",
    description:
      "Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)",
    order: 9,
  },
];
