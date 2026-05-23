import { ChevronRight, Settings } from 'lucide-react';

interface ChatHeaderProps {
  isPortrait: boolean;
  showChat: boolean;
  setShowChat: (_v: boolean) => void;
  setShowModal: (_v: boolean) => void;
}

export default function ChatHeader(props: ChatHeaderProps) {
  const { isPortrait, showChat, setShowChat, setShowModal } = props;

  return (
    <div className="flex flex-nowrap items-center justify-between p-1">
      {!isPortrait && (
        <button
          onClick={() => setShowChat(!showChat)}
          className="text-[#f0f0f5] transition-colors hover:text-[#6366f1]"
          title="Collapse"
        >
          <ChevronRight size={20} />
        </button>
      )}
      <span className="flex-1 text-center text-sm font-medium text-[#f0f0f5]">Chat Replay</span>
      <button
        onClick={() => setShowModal(true)}
        className="text-[#f0f0f5] transition-colors hover:text-[#6366f1]"
        title="Settings"
      >
        <Settings size={20} />
      </button>
    </div>
  );
}
