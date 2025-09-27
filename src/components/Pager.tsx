import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PAGINATION } from "@/utils/definitions";
import { pagerProps } from "@/types";
import Select from "./Select";

export default function Pager({ data, filter, setFilter }: pagerProps) {
  const { page, limit } = filter;
  const pageCount = data.totalPages;
  const paginationLimits = PAGINATION.PAGE_SIZE_OPTIONS.map((i) => ({
    label: i,
    value: i,
  }));
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5; // Maximum visible page numbers

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
    <Pagination className="pt-4 relative">
      <div className="absolute left-0">
        <Select
          onChange={(e) => {
            setFilter({
              limit: Number(e),
              page: 1,
            });
          }}
          value={String(limit)}
          options={paginationLimits}
        />
      </div>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                page: Math.max(filter.page - 1, 1),
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
                page: Math.min(filter.page + 1, pageCount),
              }))
            }
            isActive={page !== pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
