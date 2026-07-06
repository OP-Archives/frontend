import { Check, X } from 'lucide-react';

interface TierFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
  target: string;
  features: TierFeature[];
  highlighted?: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: '$50',
    description:
      'Essential VOD archiving with auto detection, YouTube uploads, and long VOD splitting for growing streamers.',
    target: 'Small / Indie Streamers',
    features: [
      { text: 'Auto VOD detection & archive', included: true },
      { text: 'YouTube upload (public/private)', included: true },
      { text: 'No muted parts from Twitch detecting music', included: true },
      { text: 'Uploads within the hour you end your stream', included: true },
      { text: 'Handles Long VODs (12h+ vods, splits into parts for youtube)', included: true },
      { text: 'Chapter markers', included: true },
      { text: '1 platform (Twitch OR Kick)', included: true },
      { text: 'Backfill VODs (add-on)', included: true },
      { text: 'Standard support', included: true },
      { text: 'Chat replay', included: false },
      { text: 'Chat settings', included: false },
      { text: 'Dedicated archive site', included: false },
      { text: 'Games library', included: false },
      { text: 'Smart search & filtering', included: false },
      { text: 'BTTV / FFZ / 7TV emotes', included: false },
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$100',
    description: 'Multi-platform archiving with YouTube uploads, chat replay, and your own dedicated archive site.',
    target: 'Medium Sized Streamers',
    features: [
      { text: 'Auto VOD detection & archive', included: true },
      { text: 'YouTube upload (public/private)', included: true },
      { text: 'No muted parts from Twitch detecting music', included: true },
      { text: 'Uploads within the hour you end your stream', included: true },
      { text: 'Handles Long VODs (12h+ vods, splits into parts for youtube)', included: true },
      { text: 'Chat replay', included: true },
      { text: 'Chat settings', included: true },
      { text: 'Dedicated archive site', included: true },
      { text: 'Chapter markers', included: true },
      { text: 'Games library', included: true },
      { text: 'Smart search & filtering', included: true },
      { text: 'BTTV / FFZ / 7TV emotes', included: true },
      { text: 'Unlimited platforms (Twitch/Kick)', included: true },
      { text: 'Backfill VODs (add-on)', included: true },
      { text: 'Standard support', included: true },
    ],
    highlighted: false,
  },
  {
    name: 'Pro+',
    price: '$150',
    description:
      'Multi-platform archiving with DMCA handling, per-game YouTube uploads, and priority support for serious streamers.',
    target: 'Medium / Larger Streamers',
    features: [
      { text: 'Auto VOD detection & archive', included: true },
      { text: 'YouTube upload (public/private)', included: true },
      { text: 'No muted parts from Twitch detecting music', included: true },
      { text: 'Uploads within the hour you end your stream', included: true },
      { text: 'Handles Long VODs (12h+ vods, splits into parts for youtube)', included: true },
      { text: 'Chat replay', included: true },
      { text: 'Chat settings', included: true },
      { text: 'Dedicated archive site', included: true },
      { text: 'Chapter markers', included: true },
      { text: 'Games library', included: true },
      { text: 'Smart search & filtering', included: true },
      { text: 'BTTV / FFZ / 7TV emotes', included: true },
      { text: 'Unlimited platforms (Twitch/Kick)', included: true },
      { text: 'Backfill VODs included', included: true },
      { text: 'Priority support', included: true },
      { text: 'Per-game uploads', included: true },
      { text: 'Multi-track audio', included: true },
      { text: 'DMCA handling', included: true },
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for big channels and organizations.',
    target: 'Big Channels / Organizations',
    features: [
      { text: 'Auto VOD detection & archive', included: true },
      { text: 'YouTube upload (public/private)', included: true },
      { text: 'No muted parts from Twitch detecting music', included: true },
      { text: 'Uploads within the hour you end your stream', included: true },
      { text: 'Handles Long VODs (12h+ vods, splits into parts for youtube)', included: true },
      { text: 'Chat replay', included: true },
      { text: 'Chat settings', included: true },
      { text: 'Dedicated archive site', included: true },
      { text: 'Chapter markers', included: true },
      { text: 'Games library', included: true },
      { text: 'Smart search & filtering', included: true },
      { text: 'BTTV / FFZ / 7TV emotes', included: true },
      { text: 'Unlimited platforms (Twitch/Kick)', included: true },
      { text: 'Backfill VODs included', included: true },
      { text: 'Priority support', included: true },
      { text: 'Per-game uploads', included: true },
      { text: 'Multi-track audio', included: true },
      { text: 'DMCA handling', included: true },
      { text: 'CDN support', included: true },
      { text: 'Other custom features at your request', included: true },
    ],
    highlighted: false,
  },
];

function TierCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 sm:p-8 ${
        tier.highlighted
          ? 'border-[#6366f1] bg-[#16161e] shadow-lg shadow-[#6366f1]/10'
          : 'border-[#222230] bg-[#16161e]/80'
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6366f1] px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-medium tracking-wider text-[#9ca3af] uppercase">{tier.target}</p>
        <h3 className="mt-1 text-2xl font-bold text-[#f0f0f5]">{tier.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-[#f0f0f5]">{tier.price}</span>
          {tier.price !== 'Custom' && <span className="text-sm text-[#9ca3af]">/month</span>}
        </div>
        <p className="mt-3 text-sm text-[#9ca3af]">{tier.description}</p>
      </div>

      <ul className="flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#6366f1]" />
            ) : (
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#222230]" />
            )}
            <span className={`text-sm ${feature.included ? 'text-[#d1d5db]' : 'text-[#5c5c65]'}`}>{feature.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingTiers() {
  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-3xl lg:text-4xl">Pricing</h2>
        <p className="mx-auto mt-2 max-w-lg px-2 text-sm text-[#f0f0f5] sm:mt-3 sm:max-w-2xl sm:text-base">
          Choose the plan that fits your stream. All plans include our core archiving features.
        </p>
        <div className="mx-auto mt-3 h-[1.5px] w-36 bg-[#6366f1]/40 sm:mt-4 sm:w-48" />
      </div>

      <div className="mt-8 text-center">
        <p className="text-base font-bold text-[#f0f0f5] sm:text-lg">
          Your archive. Your revenue. Every VOD uploads to your own YouTube channel. You own it, you monetize it.
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <TierCard key={tier.name} tier={tier} />
        ))}
      </div>
    </div>
  );
}
