import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { filterProps, pagerProps } from "@/schemas";
import { PAGINATION } from "@/utils/definitions";
import { useIsMobile } from "@/hooks/use-mobile";
import Select from "./Select";

export default function Pager<T extends filterProps>({
  meta,
  filter,
  setFilter,
}: pagerProps<T>) {
  const { page = 0, limit } = filter;
  const pageCount = meta.totalPages;
  const paginationLimits = PAGINATION.PAGE_SIZE_OPTIONS.map((i) => ({
    label: i,
    value: i,
  }));

  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = useIsMobile() ? 3 : 5; // Maximum visible page numbers

    if (pageCount <= maxVisible) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(pageCount, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      visiblePages.push(1);
      if (start > 2) {
        visiblePages.push(-1); // -1 represents ellipsis
      }
    }

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    if (end < pageCount) {
      if (end < pageCount - 1) {
        visiblePages.push(-1); // -1 represents ellipsis
      }
      visiblePages.push(pageCount);
    }

    return visiblePages;
  };
  return (
    <Pagination className="relative flex-col md:flex-row gap-2">
      <div className="md:absolute left-0">
        <Select
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              limit: Number(e),
              page: 1,
            }));
          }}
          value={String(limit)}
          options={paginationLimits}
        />
      </div>
      <PaginationContent className="justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                page: Math.max(page - 1, 1),
              }))
            }
            isActive={page !== 1}
          />
        </PaginationItem>
        {getVisiblePages().map((p, index) => (
          <PaginationItem key={index}>
            {p === -1 ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    page: p,
                  }))
                }
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === pageCount}
            className={
              page === pageCount ? "pointer-events-none opacity-50" : ""
            }
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                page: Math.min(page + 1, pageCount),
              }))
            }
            isActive={page !== pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
