import { useMemo } from 'react';

const Pagination = ({ meta, onPageChange }) => {
  // Generate array of page numbers
  const pages = useMemo(() => {
    if (!meta || !meta.last_page) return [];
    return Array.from({ length: meta.last_page }, (_, i) => i + 1);
  }, [meta]);

  const changePage = (page) => {
    if (page >= 1 && page <= meta.last_page) {
      onPageChange(page);
    }
  };

  // Don't render if there's only one page or no pages
  if (pages.length <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={() => changePage(meta.current_page - 1)}
        disabled={meta.current_page === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => changePage(page)}
          className={`px-3 py-1 border rounded ${
            page === meta.current_page
              ? 'bg-blue-500 text-white'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => changePage(meta.current_page + 1)}
        disabled={meta.current_page === meta.last_page}
        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
