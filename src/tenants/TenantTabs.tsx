import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

interface Tab {
  label: string;
  path: string;
  visible?: boolean;
}

export function TenantTabs({ tabs }: { tabs: Tab[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabs.find((t) => location.pathname === t.path)?.path || tabs[0]?.path;

  return (
    <div className="mt-6 w-full border-b border-[#222230]">
      <div className="relative flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`relative px-4 py-2.5 text-sm ${tab.visible === false ? 'hidden' : ''} ${
              activeTab === tab.path ? 'text-[#f0f0f5]' : 'text-[#9ca3af] hover:text-[#f0f0f5]'
            }`}
          >
            {tab.label}
            {activeTab === tab.path && (
              <motion.div
                className="absolute right-0 bottom-0 left-0 h-[2px] bg-[#6366f1]"
                layoutId="tab-indicator"
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
