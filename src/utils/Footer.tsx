import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const GITHUB_REPO = 'https://github.com/OP-Archives/frontend';

export function Footer({ className }: FooterProps) {
  const hash = (__GIT_HASH__ as string) || 'unknown';
  return (
    <footer className={`border-t border-[#222230] bg-[#16161e] px-4 py-2 ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-sm text-[#9ca3af]">
            <span className="mr-1 font-extrabold tracking-tight text-[#6366f1] drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">
              op
            </span>
            <span className="font-extrabold tracking-tight text-[#f0f0f5]">archive</span> &copy; {CURRENT_YEAR}
          </p>
          <a
            href="https://x.com/Overpowered"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block text-xs text-[#9ca3af]/60 transition-colors hover:text-[#6366f1]"
          >
            made by op with 💙
          </a>
          <a
            href={`${GITHUB_REPO}/commit/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center transition-opacity hover:opacity-50 md:justify-start"
          >
            <span className="text-xs text-[#9ca3af]/60">{`Build Version: ${hash}`}</span>
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/about" className="text-sm text-[#9ca3af] transition-colors hover:text-[#6366f1]">
            About
          </Link>
          <a
            href={`${GITHUB_REPO}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#9ca3af] transition-colors hover:text-[#6366f1]"
          >
            Issues
          </a>
        </div>
      </div>
    </footer>
  );
}
