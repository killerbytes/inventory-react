import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import GroupedCommandList, {
  MemoizedCommandItem,
} from "@/components/GroupedCommandList";
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import { Articles, ProductCombinationSearch } from "@/schemas";
import useExcludeExistToList from "@/hooks/useExcludeExists";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

export default function SuggestionLookup<T extends FieldValues>({
  data,
  form,
  name,
  index,
  ariaInvalid,
}: {
  data: Articles;
  form: UseFormReturn<T>;
  name: Path<T>;
  index: number;
  ariaInvalid?: boolean;
}) {
  const [items, setItems] = React.useState<ProductCombinationSearch[]>([]);

  const product = form.getValues(name)[index]?.value;

  const onSearch = React.useCallback(async (search: string) => {
    console.log(search);
    const combinations = await getMappedSearchProductCombinations({
      search,
    });

    setItems(combinations);

    return combinations;
  }, []);

  const options = useExcludeExistToList(items, form?.control, name);

  return (
    <>
      <ProductComboSearchCommand
        onSearch={onSearch}
        renderOptions={({ open, setOpen, search }) => (
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actual">
              <CommandItem>{data.article}</CommandItem>
            </CommandGroup>
            {data.suggestedProducts?.length > 0 && (
              <>
                <CommandGroup heading="Suggestions">
                  {data.suggestedProducts?.map((props) => {
                    const { combinations, categoryId } = props;

                    return combinations.map((item: any) => (
                      <MemoizedCommandItem
                        search={search}
                        key={item.id}
                        item={item}
                        categoryId={categoryId}
                        onSelect={() => {
                          setOpen(false);
                          form.setValue(
                            `${name}[${index}].value` as Path<T>,
                            item,
                          );
                        }}
                      />
                    ));
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            {/* <GroupedCommandList
              items={data.suggestedProducts}
              open={open}
              setOpen={setOpen}
              onSelect={onSelect}
              search={search}
            /> */}
            <GroupedCommandList
              heading="Search"
              items={options}
              open={open}
              setOpen={setOpen}
              onSelect={(item: any) => {
                form.setValue(`${name}[${index}].value` as Path<T>, item);
              }}
              search={search}
            />
            {/* <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actual">
              <CommandItem>{data.article}</CommandItem>
            </CommandGroup>
            {data.suggestedProducts?.length > 0 && (
              <>
                <CommandGroup heading="Suggestion">
                  {data.suggestedProducts?.map((props) => {
                    const { combinations, categoryId } = props;

                    return combinations.map((item: BaseProps) => (
                      <MemoizedCommandItem
                        key={item.id}
                        item={item}
                        categoryId={categoryId}
                        onSelect={() => {
                          setOpen(false);
                          form.setValue(`${name}[${index}].value`, item);
                        }}
                      />
                    ));
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            {options.length > 0 && (
              <CommandGroup heading="Search Results">
                {options.map((item) => (
                  <MemoizedCommandItem
                    key={item.id}
                    item={item}
                    onSelect={() => {
                      setOpen(false);
                      form.setValue(`${name}[${index}].value`, item);
                    }}
                  />
                ))}
              </CommandGroup>
            )} */}
          </>
        )}
      >
        <Button
          variant="outline"
          className="w-full flex justify-between h-9 min-w-[200px]"
          type="button"
          aria-invalid={ariaInvalid}
        >
          {product?.name}
          <ChevronsUpDown className="ml-auto" />
        </Button>
      </ProductComboSearchCommand>

      {/* <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full flex justify-between h-9 min-w-[200px]"
        type="button"
      >
        {product && <>{product?.name}</>}
        <ChevronsUpDown className="ml-auto" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            onValueChange={(value) => {
              console.log(value);
            }}
            placeholder="Type a command or search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actual">
              <CommandItem>{data.article}</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Suggestion">
              {data.suggestedProducts?.map((props) => {
                const { combinations, categoryId } = props;

                return combinations.map((item) => (
                  <MemoizedCommandItem
                    key={item.id}
                    item={item}
                    categoryId={categoryId}
                    //   selected={selectedId === item.id}
                    onSelect={() => {
                      setOpen(false);
                      form.setValue(`${name}[${index}].value`, item);
                    }}
                  />
                ));
              })}
            </CommandGroup>
             <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem>
                <PlusIcon />
                <span>New File</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
            </CommandGroup> 
          </CommandList>
        </Command>
      </CommandDialog> */}
    </>
  );
}
