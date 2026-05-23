import { ReactNode } from 'react';

interface CustomWidthTooltipProps {
  title: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

export default function CustomWidthTooltip({ title, placement = 'top', children }: CustomWidthTooltipProps) {
  if (!title) return <>{children}</>;

  return (
    <div className="group relative inline-flex max-w-full min-w-0 items-center">
      {children}

      <div
        className="pointer-events-none invisible absolute z-50 w-max max-w-[calc(100vw-2rem)] opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100"
        style={
          placement === 'top'
            ? { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }
            : placement === 'bottom'
              ? { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }
              : placement === 'left'
                ? { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' }
                : { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }
        }
      >
        <div
          className="bg-bg-primary rounded px-3 py-1.5 text-sm break-words whitespace-normal text-white shadow-lg"
          style={{ maxWidth: 'min(400px, calc(100vw - 2rem))' }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
