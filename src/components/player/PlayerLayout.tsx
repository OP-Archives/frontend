import { type ReactNode } from 'react';
import Chat, { type ChatProps } from '@/components/player/Chat/Chat';
import { PlayerTenantProfile } from '@/components/player/PlayerTenantProfile';
import type { Tenant } from '@/types';

interface PlayerLayoutProps {
  isPortrait: boolean;
  chatOnLeft: boolean;
  setChatOnLeft: (v: boolean) => void;
  tenantData: Tenant | null;
  playerElement: ReactNode;
  chatProps: ChatProps;
  recentItems: ReactNode;
}

export function PlayerLayout({
  isPortrait,
  chatOnLeft,
  setChatOnLeft,
  tenantData,
  playerElement,
  chatProps,
  recentItems,
}: PlayerLayoutProps) {
  const layoutClass = isPortrait ? 'flex-col' : chatOnLeft ? 'flex-row-reverse' : 'flex-row';

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className={`flex flex-1 ${layoutClass} min-h-0 min-w-0 overflow-hidden`}>
        <div
          className={`flex min-w-0 [scrollbar-width:none] flex-col overflow-x-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isPortrait ? 'w-full flex-shrink-0 overflow-y-visible' : 'flex-1 overflow-y-auto'}`}
        >
          <div className={`flex w-full shrink-0 flex-col ${isPortrait ? '' : 'h-full'}`}>{playerElement}</div>
          {!isPortrait && tenantData && (
            <div className="theatre-hide flex w-full flex-col">
              <div className="w-full shrink-0">
                <PlayerTenantProfile tenantData={tenantData} />
              </div>
              {recentItems}
            </div>
          )}
        </div>

        {isPortrait && <hr className="shrink-0 border-[#222230]" />}
        {!isPortrait && <div className="w-px shrink-0 bg-[#222230]" />}

        <Chat {...chatProps} chatOnLeft={chatOnLeft} setChatOnLeft={setChatOnLeft} />
      </div>
    </div>
  );
}
