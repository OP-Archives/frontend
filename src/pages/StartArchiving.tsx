import { Copy } from 'lucide-react';
import { useState } from 'react';
import { MailIcon, DiscordIcon, XIcon } from '@/assets/icons';
import { Background } from '@/components/Background';
import { PricingTiers } from '@/components/ui/PricingTiers';

const CONTACT_LINKS = [
  {
    icon: MailIcon,
    label: 'Email',
    href: 'mailto:op@overpowered.tv',
    copyable: 'op@overpowered.tv',
  },
  {
    icon: DiscordIcon,
    label: 'Discord',
    href: 'https://discord.gg/MMkrjWkCmS',
    copyable: 'Overpowered',
  },
  {
    icon: XIcon,
    label: 'X',
    href: 'https://x.com/Overpowered',
    copyable: '@Overpowered',
  },
];

interface ContactLink {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  copyable: string;
}

function ContactCard({ contact, isLink }: { contact: ContactLink; isLink: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(contact.copyable);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const Icon = contact.icon;

  const content = (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#222230] text-[#6366f1] transition-colors group-hover:bg-[#6366f1]/20">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#f0f0f5] group-hover:text-[#6366f1]">{contact.label}</p>
        <p className="mt-1 text-sm text-[#f0f0f5]">{contact.copyable}</p>
      </div>
      <button
        onClick={handleCopy}
        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-[#222230] hover:text-[#6366f1]"
        title="Copy to clipboard"
      >
        <Copy className="h-4 w-4" />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-[#222230] px-2 py-1 text-xs whitespace-nowrap text-[#f0f0f5]">
            Copied!
          </span>
        )}
      </button>
    </div>
  );

  if (isLink) {
    return (
      <a
        href={contact.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group rounded-lg border border-[#222230] bg-[#16161e]/80 p-6 backdrop-blur-sm transition-all hover:border-[#6366f1]/50 hover:bg-[#16161e]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="group rounded-lg border border-[#222230] bg-[#16161e]/80 p-6 backdrop-blur-sm transition-all hover:border-[#6366f1]/50 hover:bg-[#16161e]">
      {content}
    </div>
  );
}

export function StartArchiving() {
  return (
    <div className="relative">
      <Background />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-5xl">Start Archiving Today!</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#f0f0f5]">
            Everything you need to preserve, organize, and share your streams - automatically.
          </p>
          <div className="mx-auto mt-4 h-[1.5px] w-48 bg-[#6366f1]/40" />
        </div>

        <div className="mt-20">
          <PricingTiers />
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-[#f0f0f5]">
            Have questions or ready to get started? Reach out through any of these channels.
          </p>
          <p className="mt-2 text-sm text-[#f0f0f5]">I typically respond within 24 hours</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_LINKS.map((contact) => (
            <ContactCard key={contact.label} contact={contact} isLink={contact.href !== ''} />
          ))}
        </div>
      </div>
    </div>
  );
}
