import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function CustomWidthTooltip({
  children,
  title,
}: {
  children: React.ReactElement;
  title: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isHovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className="inline-flex max-w-full min-w-0 items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[1300]"
            style={{
              top: coords.top,
              left: coords.left,
              transform: 'translate(-50%, calc(-100% - 8px))',
              width: 'max-content',
              maxWidth: 'calc(100vw - 2rem)',
            }}
          >
            <div className="animate-[fadeIn_0.2s_ease-out] rounded-lg border border-[#222230] bg-[#16161e] px-3 py-1.5 text-sm break-words whitespace-normal text-white shadow-lg">
              {title}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
