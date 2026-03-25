import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageUrl, getPageNumbers } from "@/lib/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-8">
      {currentPage > 1 ? (
        <Link
          href={pageUrl(basePath, currentPage - 1)}
          className="inline-flex items-center justify-center size-9 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center size-9 rounded-md text-sm text-muted-foreground/40 cursor-not-allowed">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex items-center justify-center size-9 text-sm text-muted-foreground"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={pageUrl(basePath, page)}
            className={cn(
              "inline-flex items-center justify-center size-9 rounded-md text-sm transition-colors",
              page === currentPage
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageUrl(basePath, currentPage + 1)}
          className="inline-flex items-center justify-center size-9 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center size-9 rounded-md text-sm text-muted-foreground/40 cursor-not-allowed">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
