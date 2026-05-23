import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useDebouncedCallback } from '@/components/player/utils/debounceHelper';
import { safeLocalStorage } from '@/components/player/utils/safeLocalStorage';

interface ChatSettingsModalProps {
  userChatDelay: number;
  setUserChatDelay: (_v: number) => void;
  showModal: boolean;
  setShowModal: (_v: boolean) => void;
  showTimestamp: boolean;
  setShowTimestamp: (_v: boolean) => void;
  chatWidth: number | undefined;
  setChatWidth: (_v: number | undefined) => void;
}

export default function ChatSettingsModal(props: ChatSettingsModalProps) {
  const {
    userChatDelay,
    setUserChatDelay,
    showModal,
    setShowModal,
    showTimestamp,
    setShowTimestamp,
    chatWidth,
    setChatWidth,
  } = props;
  const [filterWords, setFilterWords] = useState<string[]>([]);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showModal) {
      const savedSettings = safeLocalStorage.getItem('chatSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings) || {};
          if (parsed.filterWords && Array.isArray(parsed.filterWords)) {
            setFilterWords(parsed.filterWords as string[]);
          }
        } catch (e) {
          console.error('Failed to parse chat settings from localStorage', e);
        }
      }
    }
  }, [showModal]);

  const debouncedDelayChange = useDebouncedCallback((value: unknown) => {
    if (!isNaN(Number(value))) {
      setUserChatDelay(Number(value));
    }
  }, 300);

  const saveSetting = (key: string, value: unknown) => {
    const savedSettings = safeLocalStorage.getItem('chatSettings');
    let settings: Record<string, unknown> = {};
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings) || {};
      } catch (e) {
        console.error('Failed to parse chat settings from localStorage', e);
      }
    }
    settings[key] = value;
    safeLocalStorage.setItem('chatSettings', JSON.stringify(settings));

    if (key === 'filterWords') {
      window.dispatchEvent(new Event('chat-settings-updated'));
    }
  };

  const debouncedSaveSetting = useDebouncedCallback((...args: unknown[]) => {
    saveSetting(args[0] as string, args[1]);
  }, 500);

  const handleAddWord = () => {
    const input = document.getElementById('filter-word-input') as HTMLInputElement | null;
    if (!input) return;
    const word = input.value.trim();
    if (word && !filterWords.includes(word)) {
      setFilterWords([...filterWords, word]);
      debouncedSaveSetting('filterWords', [...filterWords, word]);
      input.value = '';
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setFilterWords(filterWords.filter((word) => word !== wordToRemove));
    debouncedSaveSetting(
      'filterWords',
      filterWords.filter((word) => word !== wordToRemove)
    );
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-content') === null) {
      setShowModal(false);
    }
  };

  const sliderMin = 150;
  const sliderMax = typeof window !== 'undefined' ? Math.min(window.innerWidth - 400, 800) : 800;
  const sliderDisabled = typeof window !== 'undefined' && window.innerWidth - 400 <= 150;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        showModal ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="fixed inset-0 bg-black/80" />
      <div
        className={`modal-content relative z-10 w-[350px] rounded-xl border border-[#222230] bg-[#16161e] p-6 shadow-2xl transition-transform duration-200 ${
          showModal ? 'scale-100' : 'scale-95'
        }`}
      >
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 text-[#9ca3af] transition-colors hover:text-[#f0f0f5]"
        >
          <X size={18} />
        </button>

        <h2 className="mb-5 text-center text-lg font-semibold text-[#f0f0f5]">Chat Settings</h2>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm text-[#9ca3af]">Chat Delay</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="flex-1 rounded-lg border border-[#222230] bg-[#222230] px-3 py-2 text-sm text-[#f0f0f5] transition-all focus:border-[#6366f1] focus:outline-none"
                value={userChatDelay}
                onChange={(e: ChangeEvent<HTMLInputElement>) => debouncedDelayChange(e.target.value)}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
              />
              <span className="text-sm whitespace-nowrap text-[#9ca3af]">secs</span>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm text-[#9ca3af]">Chat Width</p>
            <div className="flex w-full items-center gap-2">
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={10}
                disabled={sliderDisabled}
                value={chatWidth ?? 340}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  setChatWidth(num);
                  debouncedSaveSetting('chatWidth', num);
                }}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-[#222230] accent-[#6366f1]"
              />
              <span className="text-sm whitespace-nowrap text-[#9ca3af]">{chatWidth ?? 340}px</span>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm text-[#9ca3af]">Filter Words</p>
            <div className="mb-2 flex">
              <input
                id="filter-word-input"
                type="text"
                className="flex-1 rounded-l-lg border border-[#222230] bg-[#222230] px-3 py-2 text-sm text-[#f0f0f5] transition-all focus:border-[#6366f1] focus:outline-none"
                placeholder="Add word to filter"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddWord()}
              />
              <button
                onClick={handleAddWord}
                className="rounded-r-lg border border-l-0 border-[#222230] bg-[#222230] px-3 text-[#9ca3af] transition-colors hover:bg-[#222230] hover:text-[#f0f0f5]"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="chat-scrollbar max-h-[150px] overflow-y-auto rounded-lg border border-[#222230] p-2">
              {filterWords.length > 0 ? (
                filterWords.map((word, index) => (
                  <div key={index} className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-[#f0f0f5]">{word}</span>
                    <button
                      onClick={() => handleRemoveWord(word)}
                      className="text-red-400 transition-colors hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#5c5c65]">No filter words added</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-timestamp"
              checked={showTimestamp}
              onChange={() => {
                setShowTimestamp(!showTimestamp);
                debouncedSaveSetting('showTimestamp', !showTimestamp);
              }}
              className="h-4 w-4 rounded accent-[#6366f1]"
            />
            <label htmlFor="show-timestamp" className="text-sm text-[#9ca3af]">
              Show Timestamps
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
