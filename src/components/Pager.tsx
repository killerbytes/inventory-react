import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PagerProps {
  data: { totalPages: number };
  page: number;
  setPage: (newPage: number) => void;
}

export default function Pager({ data, page, setPage }: PagerProps) {
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5; // Maximum visible page numbers

    if (data.totalPages <= maxVisible) {
      return Array.from({ length: data.totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(data.totalPages, start + maxVisible - 1);

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

    if (end < data.totalPages) {
      if (end < data.totalPages - 1) {
        visiblePages.push(-1); // -1 represents ellipsis
      }
      visiblePages.push(data.totalPages);
    }

    return visiblePages;
  };

  return (
    <Pagination className="pt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage(Math.max(page - 1, 1))}
            isActive={page !== 1}
          />
        </PaginationItem>

        {getVisiblePages().map((p, index) => (
          <PaginationItem key={index}>
            {p === -1 ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink onClick={() => setPage(p)} isActive={p === page}>
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(Math.min(page + 1, data.totalPages))}
            isActive={page !== data.totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
