interface NotFoundProps {
  channel?: string;
  logo?: string;
}

export function NotFound({ channel }: NotFoundProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#6366f1]">404</h1>
        {channel && <p className="mt-2 text-lg text-[#f0f0f5]">{channel}</p>}
        <p className="mt-4 text-xl text-[#9ca3af]">VOD not found</p>
      </div>
    </div>
  );
}
