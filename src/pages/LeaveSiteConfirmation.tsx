import { ArrowLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function LeaveSiteConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUrl = searchParams.get('target');

  if (!targetUrl) {
    navigate('/');
    return null;
  }

  const handleProceed = () => {
    window.location.href = targetUrl;
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#222230] bg-[#16161e] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#f0f0f5]">Leaving this site</h1>
            <p className="text-sm text-[#9ca3af]">You are about to navigate to an external website</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-[#0c0c14] p-3">
          <p className="font-mono text-sm break-all text-[#f0f0f5]">{targetUrl}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#222230] bg-transparent px-4 py-2.5 text-sm font-medium text-[#9ca3af] transition-colors hover:bg-[#18181b] hover:text-[#f0f0f5]"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#818cf8]"
          >
            Proceed
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
