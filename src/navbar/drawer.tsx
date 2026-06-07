import { AnimatePresence, motion } from 'framer-motion';
import { X, Menu, ArrowRight, Info, MessageSquareIcon, HomeIcon, Shield, FileText, Heart, Users } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { drawerBackdrop, drawerPanel, menuItem } from '@/motion/variants';

const CURRENT_YEAR = new Date().getFullYear();
const hash = (__GIT_HASH__ as string) || 'unknown';

export function Drawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="p-2 text-[#9ca3af] hover:text-[#f0f0f5]" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div key="drawer-modal" className="fixed inset-0 z-[100] flex">
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                variants={drawerBackdrop}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={() => setOpen(false)}
              />

              <motion.div
                className="relative flex h-full w-64 flex-col border-r border-[#222230] bg-[#16161e] p-4"
                variants={drawerPanel}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <button
                  className="absolute top-4 right-4 p-2 text-[#9ca3af] hover:text-[#f0f0f5]"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="inline-flex w-fit flex-col pt-2">
                  <p className="text-xl font-extrabold tracking-tight">
                    <span className="mr-1 text-[#6366f1] drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">op</span>
                    <span className="text-[#f0f0f5]">archive</span>
                  </p>
                </div>

                <div className="mt-4 h-px w-full bg-[#333345]" />

                <div className="mt-4 flex flex-col gap-4">
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <Link
                      to="/"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                      onClick={() => setOpen(false)}
                    >
                      <HomeIcon className="h-4 w-4 shrink-0" />
                      <span>Home</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <Link
                      to="/browse"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                      onClick={() => setOpen(false)}
                    >
                      <Users className="h-4 w-4 shrink-0" />
                      <span>Browse</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <Link
                      to="/archive"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                      onClick={() => setOpen(false)}
                    >
                      <ArrowRight className="h-4 w-4 shrink-0" />
                      <span>Start Archiving</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <Link
                      to="/about"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                      onClick={() => setOpen(false)}
                    >
                      <Info className="h-4 w-4 shrink-0" />
                      <span>About</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <Link
                      to="/privacy"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                      onClick={() => setOpen(false)}
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Privacy</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <Link
                      to="/tos"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                      onClick={() => setOpen(false)}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span>Terms of Service</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <a
                      href="https://ko-fi.com/overpoweredgg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                    >
                      <Heart className="h-4 w-4 shrink-0" />
                      <span>Support Me</span>
                    </a>
                  </motion.div>
                  <motion.div variants={menuItem} initial="hidden" animate="visible" exit="hidden">
                    <a
                      href="https://github.com/OP-Archives/frontend/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-medium text-[#9ca3af] hover:text-[#f0f0f5]"
                    >
                      <MessageSquareIcon className="h-4 w-4 shrink-0" />
                      <span>Issues</span>
                    </a>
                  </motion.div>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-6">
                  <div className="h-px w-full bg-[#333345]" />
                  <div className="flex flex-col gap-1 text-center">
                    <p className="text-sm text-[#9ca3af]">
                      <span className="mr-1 font-extrabold tracking-tight text-[#6366f1] drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                        op
                      </span>
                      <span className="font-extrabold tracking-tight text-[#f0f0f5]">archive</span> &copy;{' '}
                      {CURRENT_YEAR}
                    </p>
                    <a
                      href="https://x.com/Overpowered"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 text-xs text-[#9ca3af]/60 hover:text-[#6366f1]"
                    >
                      made by op with 💙
                    </a>
                    <a
                      href={`https://github.com/OP-Archives/frontend/commit/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#9ca3af]/60 hover:opacity-50"
                    >
                      Build Version: {hash}
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
