import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  preserveParams?: Record<string, string>;
  onHoverPage?: (_page: number) => void;
}

export function PaginationControls({ page, totalPages, preserveParams, onHoverPage }: PaginationControlsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pageInputRef.current) {
      pageInputRef.current.value = String(page);
    }
  }, [page]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const baseParams = (() => {
    const params = new URLSearchParams();
    if (preserveParams) {
      Object.entries(preserveParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
    }
    return params;
  })();

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(baseParams);
    if (pageNum !== 1) params.set('page', String(pageNum));
    else params.delete('page');

    const queryStr = params.toString();
    return `${location.pathname}${queryStr ? `?${queryStr}` : ''}`;
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = pageInputRef.current?.value;
    const num = Number(value);
    if (e.key === 'Enter' && !isNaN(num) && num > 0 && num <= totalPages) {
      navigate(buildPageUrl(num));
    }
  };

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1, 2];

    if (page > 3 && page < totalPages - 2) {
      pages.push('ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages - 1, totalPages);
    } else if (page <= 3) {
      pages.push(3, 4, 5, 'ellipsis', totalPages - 1, totalPages);
    } else if (page === totalPages - 2) {
      pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push('ellipsis', totalPages - 2, totalPages - 1, totalPages);
    }

    return pages;
  })();

  return (
    <div className={`flex items-center justify-center ${totalPages <= 1 ? '' : 'mt-3 mb-3'}`}>
      {totalPages !== null && totalPages > 0 && (
        <>
          <div className="flex items-center gap-[1px]">
            {page <= 1 ? (
              <button
                disabled
                className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-[#222230] text-sm text-white opacity-30"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <Link
                to={buildPageUrl(page - 1)}
                onMouseEnter={() => onHoverPage && onHoverPage(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#222230] text-sm text-white hover:bg-[#16161e]"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            {pageNumbers.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-sm text-[#9ca3af]">
                    ...
                  </span>
                );
              }
              return (
                <Link
                  key={`${p}-${idx}`}
                  to={buildPageUrl(p)}
                  onMouseEnter={() => onHoverPage && onHoverPage(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm ${
                    p === page
                      ? 'border-[#6366f1] bg-[#6366f1]/20 text-[#6366f1]'
                      : 'border-[#222230] text-white hover:bg-[#16161e]'
                  }`}
                >
                  {p}
                </Link>
              );
            })}
            {page >= totalPages ? (
              <button
                disabled
                className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-[#222230] text-sm text-white opacity-30"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <Link
                to={buildPageUrl(page + 1)}
                onMouseEnter={() => onHoverPage && onHoverPage(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#222230] text-sm text-white hover:bg-[#16161e]"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <input
              ref={pageInputRef}
              className="ml-1 h-8 w-14 rounded-lg border border-[#222230] bg-[#16161e] px-0 py-0 text-center text-sm text-white placeholder-[#9ca3af]"
              type="text"
              defaultValue={page}
              onKeyDown={handleSubmit}
              placeholder="Page"
              aria-label="Page number"
            />
          </div>
        </>
      )}
    </div>
  );
}
