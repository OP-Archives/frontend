import type { ReactNode } from 'react';

interface Section {
  heading: string;
  content: React.ReactNode;
}

interface ContentPageProps {
  title: string | ReactNode;
  subtitle?: string;
  sections: Section[];
  cta?: React.ReactNode;
}

export function ContentPage({ title, subtitle, sections, cta }: ContentPageProps) {
  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 text-lg text-[#9ca3af] sm:text-xl">{subtitle}</p>}
          <div className="mx-auto mt-4 h-[1.5px] w-48 bg-[#6366f1]/40" />
        </div>

        <div className="mt-12 space-y-16">
          {sections.map((section, i) => (
            <div
              key={i}
              className="mx-auto max-w-3xl rounded-xl border border-[#222230] bg-[#16161e]/60 p-6 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-[#6366f1]">{section.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-[#f0f0f5]">{section.content}</div>
            </div>
          ))}
        </div>

        {cta && <div className="mt-16 text-center">{cta}</div>}
      </div>
    </div>
  );
}
