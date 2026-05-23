import { Pause } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import type { Comment } from '@/types';

interface ChatMessagesProps {
  comments: Comment[] | React.MutableRefObject<Comment[]>;
  shownMessages: React.ReactElement[];
  scrolling: boolean;
  scrollToBottom: () => void;
  chatRef: React.MutableRefObject<HTMLElement | null>;
  handleScroll: () => void;
}

export default function ChatMessages(props: ChatMessagesProps) {
  const { comments, shownMessages, scrolling, scrollToBottom, chatRef, handleScroll } = props;

  const commentsArray = Array.isArray(comments) ? comments : comments.current;

  if (commentsArray && commentsArray.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="spinner mt-2" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SimpleBar
        scrollableNodeProps={{ ref: chatRef, onScroll: handleScroll }}
        style={{ height: '100%', overflowX: 'hidden' }}
      >
        <div className="flex flex-col justify-end p-0">
          <div className="flex min-h-0 flex-wrap">{shownMessages}</div>
        </div>
      </SimpleBar>
      {scrolling && (
        <div className="relative flex justify-center">
          <button
            onClick={scrollToBottom}
            className="absolute bottom-1 z-10 flex cursor-pointer items-center gap-1.5 rounded-full bg-[#16161e] px-4 py-2 text-xs text-[#9ca3af] shadow-md transition-all hover:bg-[#16161e] hover:text-[#f0f0f5]"
          >
            <Pause size={18} />
            <span>Chat Paused</span>
          </button>
        </div>
      )}
    </>
  );
}
