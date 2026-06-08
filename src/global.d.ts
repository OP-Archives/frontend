declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'can-autoplay' {
  interface CanAutoplayResult {
    video: boolean;
    audio: boolean;
  }
  function canAutoplay(options: unknown): Promise<CanAutoplayResult>;
  namespace canAutoplay {
    export function video(options?: { inline?: boolean; muted?: boolean }): Promise<{ result: boolean }>;
  }
  export default canAutoplay;
}

declare module 'humanize-duration' {
  function humanizeDuration(ms: number, options?: Record<string, unknown>): string;
  export default humanizeDuration;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Document {
  webkitIsFullScreen?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitCurrentFullScreenElement?: Element | null;
  webkitExitFullscreen(): Promise<void>;
}

interface HTMLElement {
  webkitRequestFullscreen(options?: RequestFullscreenOptions): Promise<void>;
  webkitEnterFullscreen?(): void;
}

interface CSSStyleSheet {
  addRule?(selector: string, style: string, index?: number): number;
  removeRule?(index: number): string;
}

declare const __GIT_HASH__: string;

interface Window {
  __GIT_HASH__: string;
  adsbygoogle: unknown[];
}
