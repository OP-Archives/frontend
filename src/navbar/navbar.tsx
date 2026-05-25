import { Search, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer } from '@/navbar/drawer';
import { useDebounce } from '@/utils/debounceHelper';
import { useTenants } from '@/utils/useTenants';

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, { debounceMs: 200 });
  const navigate = useNavigate();

  const { data: searchResults, isFetching } = useTenants(
    debouncedSearch.length >= 2 ? ({ search: debouncedSearch } as Record<string, string>) : undefined
  );

  const handleSearchSubmit = () => {
    if (!searchInput.trim()) return;
    navigate(`/${searchInput.trim().toLowerCase().replace(/\s+/g, '-')}/vods`);
    setSearchOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#222230] bg-[#16161e] backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          <span className="mr-1 text-[#6366f1] drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">op</span>
          <span className="text-[#f0f0f5]">archive</span>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
          className="mx-2 mr-4 max-w-xs min-w-0 flex-1 sm:mx-4"
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchOpen(e.target.value.length >= 2);
              }}
              onFocus={() => setSearchOpen(searchInput.length >= 2)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              className="h-9 w-full rounded-md border border-[#222230] bg-[#16161e] pr-3 pl-9 text-sm text-[#f0f0f5] placeholder-[#9ca3af] transition-colors outline-none focus:border-[#6366f1]"
            />
            {searchOpen && debouncedSearch.length >= 2 && (
              <div className="absolute top-full left-0 mt-1 w-full overflow-hidden rounded-lg border border-[#222230] bg-[#16161e] shadow-lg">
                {isFetching ? (
                  <div className="flex h-8 items-center justify-center">
                    <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-[#6366f1] border-t-transparent" />
                  </div>
                ) : searchResults?.data && searchResults.data.length > 0 ? (
                  searchResults.data.map((tenant: { id: string; display_name: string; profile_image_url: string }) => (
                    <Link
                      key={tenant.id}
                      to={`/${tenant.id}/vods`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#9ca3af] transition-colors hover:bg-[#222230] hover:text-[#f0f0f5]"
                      onClick={() => setSearchOpen(false)}
                    >
                      <img
                        src={tenant.profile_image_url}
                        alt=""
                        className="h-6 w-6 flex-shrink-0 rounded-full bg-[#222230]"
                      />
                      <span className="truncate font-medium">{tenant.display_name}</span>
                    </Link>
                  ))
                ) : null}
                <div
                  className="flex cursor-pointer items-center gap-2 border-t border-[#222230] px-4 py-2.5 text-sm text-[#9ca3af] transition-colors hover:bg-[#222230] hover:text-[#f0f0f5]"
                  onClick={() => {
                    setSearchOpen(false);
                    handleSearchSubmit();
                  }}
                >
                  <span className="truncate">Go to {searchInput}</span>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-3">
          <Link
            to="/archive"
            className="hidden items-center gap-1.5 rounded-md bg-[#6366f1] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5558ea] sm:flex"
          >
            <span>Start Archiving Today!</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="md:hidden">
            <Drawer />
          </div>
        </div>
      </div>
    </nav>
  );
}
