import { useNavigate } from 'react-router-dom';

interface NotFoundProps {
  channel?: string;
  logo?: string;
  message?: string;
  backToHome?: boolean;
}

export function NotFound({ channel, message, backToHome }: NotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#6366f1]">404</h1>
        {channel && <p className="mt-2 text-lg text-[#f0f0f5]">{channel}</p>}
        <p className="mt-4 text-xl text-[#9ca3af]">{message || 'VOD not found'}</p>
        {backToHome && (
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-[#6366f1] px-6 py-2 text-white transition hover:bg-[#4f46e5]"
          >
            Back to Home
          </a>
        )}
        {!backToHome && (
          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-block rounded-lg bg-[#6366f1] px-6 py-2 text-white transition hover:bg-[#4f46e5]"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
