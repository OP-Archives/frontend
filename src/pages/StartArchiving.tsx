import { Check, Info } from 'lucide-react';
import { MailIcon, DiscordIcon, XIcon } from '@/assets/icons';

const FEATURES = [
  { icon: 'check', text: 'Archiving Twitch Vods / Kick VODS' },
  { icon: 'check', text: 'Only Games support (clipping out only games from the vod)' },
  { icon: 'check', text: 'Uploads whole VODs or games to YouTube automatically' },
  { icon: 'check', text: 'Chat replay' },
  {
    icon: 'info',
    text: 'CDN available (may incur additional charges, limited to 14 days of VODs)',
  },
];

const CONTACT_LINKS = [
  {
    icon: MailIcon,
    label: 'Email',
    href: 'mailto:op@overpowered.tv',
    username: 'op@overpowered.tv',
  },
  {
    icon: DiscordIcon,
    label: 'Discord',
    href: '',
    username: 'Overpowered',
  },
  {
    icon: XIcon,
    label: 'X',
    href: 'https://x.com/Overpowered',
    username: 'Overpowered',
  },
];

export function StartArchiving() {
  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-5xl">Start Archiving</h1>
          <div className="mx-auto mt-4 h-[1.5px] w-48 bg-[#6366f1]/40" />
        </div>

        <div className="mx-auto mt-12 max-w-lg text-center">
          <h2 className="text-xl font-semibold text-[#f0f0f5]">What's included</h2>
          <div className="mx-auto mt-4 w-full rounded-lg border border-[#222230] bg-[#16161e]/80 p-4 text-left backdrop-blur-sm">
            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature.text} className="flex items-center gap-2">
                  {feature.icon === 'check' ? (
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#6366f1]" />
                  ) : (
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#6366f1]" />
                  )}
                  <span className="text-sm text-[#d1d5db]">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-[#f0f0f5]">Contact me via one of these options for inquiries and questions.</p>
          <p className="mt-2 text-sm text-[#9ca3af]">I typically respond within 24 hours</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_LINKS.map((contact) => {
            const Icon = contact.icon;
            const isLink = contact.href !== '';
            const content = (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#222230] text-[#6366f1] transition-colors group-hover:bg-[#6366f1]/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#f0f0f5] group-hover:text-[#6366f1]">{contact.label}</p>
                  {contact.username ? <p className="mt-1 text-sm text-[#f0f0f5]">{contact.username}</p> : null}
                </div>
              </div>
            );

            if (isLink) {
              return (
                <a
                  key={contact.label}
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
              <div
                key={contact.label}
                className="group rounded-lg border border-[#222230] bg-[#16161e]/80 p-6 backdrop-blur-sm transition-all hover:border-[#6366f1]/50 hover:bg-[#16161e]"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
