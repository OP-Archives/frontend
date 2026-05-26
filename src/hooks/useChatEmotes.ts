import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { EmotesResponse, FfzEmote, BttvEmote, SevenTVEmote, EmoteEntry, EmoteProvider } from '@/types';
import { archiveClient } from '@/utils/archive-client';

const BASE_TWITCH_CDN = 'https://static-cdn.jtvnw.net';
const BASE_FFZ_EMOTE_CDN = 'https://cdn.frankerfacez.com/emote';
const BASE_BTTV_EMOTE_CDN = 'https://cdn.betterttv.net/emote';
const BASE_7TV_EMOTE_CDN = 'https://cdn.7tv.app/emote';
const BASE_FFZ_EMOTE_API = 'https://api.frankerfacez.com/v1';
const BASE_BTTV_EMOTE_API = 'https://api.betterttv.net/3';
const BASE_7TV_EMOTE_API = 'https://7tv.io/v3';

interface UseChatEmotesOptions {
  channel: string;
  vodId: string;
  twitchId?: number;
}

export interface UseChatEmotesReturn {
  emotes: Omit<EmotesResponse, 'vodId'>;
  emoteLookup: Map<string, EmoteEntry>;
  getEmoteImageUrl: (emote: EmoteEntry, type: EmoteProvider, size?: number) => string;
  getEmoteImageSrcSet: (emote: EmoteEntry, type: EmoteProvider) => string;
  seventvIsZeroWidth: (emote: EmoteEntry) => boolean;
}

export function useChatEmotes({ channel, vodId, twitchId }: UseChatEmotesOptions): UseChatEmotesReturn {
  const [emotes, setEmotes] = useState<Omit<EmotesResponse, 'vodId'>>({
    ffz_emotes: [],
    bttv_emotes: [],
    seventv_emotes: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const abortSignal = abortControllerRef.current.signal;

    const loadArchiveEmotes = async () => {
      try {
        const response = await archiveClient.vods.emotes(channel, vodId);
        if (!response.success) throw response;
        const data = response.data;
        const hasFfz = data.ffz_emotes?.length;
        const hasBttv = data.bttv_emotes?.length;
        const has7tv = data.seventv_emotes?.length;

        if (hasFfz || hasBttv || has7tv) {
          setEmotes((prev) => ({
            ffz_emotes: hasFfz ? data.ffz_emotes : prev.ffz_emotes,
            bttv_emotes: hasBttv ? data.bttv_emotes : prev.bttv_emotes,
            seventv_emotes: has7tv ? data.seventv_emotes : prev.seventv_emotes,
          }));
        }

        loadBTTVGlobalEmotes();
        load7TVGlobalEmotes();

        if (!hasFfz) loadFFZEmotes();
        if (!hasBttv) loadBTTVChannelEmotes();
        if (!has7tv) load7TVEmotes();
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error(e);
          fallbackLoadEmotes();
        }
      }
    };

    const fallbackLoadEmotes = async () => {
      await Promise.all([
        loadBTTVChannelEmotes(),
        loadBTTVGlobalEmotes(),
        load7TVEmotes(),
        load7TVGlobalEmotes(),
        loadFFZEmotes(),
      ]);
    };

    const loadBTTVGlobalEmotes = async () => {
      await fetch(`${BASE_BTTV_EMOTE_API}/cached/emotes/global`, {
        method: 'GET',
        signal: abortSignal,
      })
        .then((response) => response.json())
        .then((data) => {
          if ((data as { status: number }).status >= 400) return;
          setEmotes((emotes) => ({
            ...emotes,
            bttv_emotes: emotes.bttv_emotes.concat((data as BttvEmote[]) || []),
          }));
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
        });
    };

    const loadBTTVChannelEmotes = async () => {
      if (!twitchId) return;
      await fetch(`${BASE_BTTV_EMOTE_API}/cached/users/twitch/${twitchId}`, {
        method: 'GET',
        signal: abortSignal,
      })
        .then((response) => response.json())
        .then((data) => {
          if ((data as { status: number }).status >= 400) return;
          const d = data as { sharedEmotes?: BttvEmote[]; channelEmotes?: BttvEmote[] };
          setEmotes((emotes) => ({
            ...emotes,
            bttv_emotes: emotes.bttv_emotes.concat((d.sharedEmotes || []).concat(d.channelEmotes || [])),
          }));
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
        });
    };

    const loadFFZEmotes = async () => {
      if (!twitchId) return;
      await fetch(`${BASE_FFZ_EMOTE_API}/room/id/${twitchId}`, {
        method: 'GET',
        signal: abortSignal,
      })
        .then((response) => response.json())
        .then((data) => {
          if ((data as { status: number }).status >= 400) return;
          const d = data as { sets?: Record<string, { emoticons: FfzEmote[] }>; room?: { set?: number } };
          const emoticons = d.sets?.[String(d.room?.set)]?.emoticons || [];
          setEmotes((emotes) => ({ ...emotes, ffz_emotes: emoticons }));
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
        });
    };

    const load7TVEmotes = async () => {
      if (!twitchId) return;
      await fetch(`${BASE_7TV_EMOTE_API}/users/twitch/${twitchId}`, {
        method: 'GET',
        signal: abortSignal,
      })
        .then((response) => response.json())
        .then((data) => {
          if ((data as { status_code: number }).status_code >= 400) return;
          const d = data as { emote_set?: { emotes: SevenTVEmote[] } };
          setEmotes((emotes) => ({ ...emotes, seventv_emotes: d.emote_set?.emotes || [] }));
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
        });
    };

    const load7TVGlobalEmotes = async () => {
      await fetch(`${BASE_7TV_EMOTE_API}/emote-sets/global`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortSignal,
      })
        .then((response) => response.json())
        .then((data) => {
          const d = data as { emotes: SevenTVEmote[] };
          setEmotes((emotes) => ({
            ...emotes,
            seventv_emotes: emotes.seventv_emotes.concat(d.emotes || []),
          }));
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
        });
    };

    loadArchiveEmotes();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [vodId, twitchId, channel]);

  const emoteLookup = useMemo(() => {
    const lookup = new Map<string, EmoteEntry>();
    const ffz = (emotes as { ffz_emotes?: FfzEmote[] })?.ffz_emotes || [];
    const bttv = (emotes as { bttv_emotes?: BttvEmote[] })?.bttv_emotes || [];
    const seventv = (emotes as { seventv_emotes?: SevenTVEmote[] })?.seventv_emotes || [];

    ffz.forEach((emote: FfzEmote) => {
      const code = emote.code || emote.text;
      const name = emote.name || code;
      lookup.set(code || name, { ...emote, code, name, provider: 'FFZ' as EmoteProvider });
    });
    bttv.forEach((emote: BttvEmote) =>
      lookup.set(emote.code, { ...emote, name: emote.code, provider: 'BTTV' as EmoteProvider })
    );
    seventv.forEach((emote: SevenTVEmote) => {
      const code = emote.code || '';
      const name = emote.name || code;
      lookup.set(name, { ...emote, code, name, provider: '7TV' as EmoteProvider });
    });

    return lookup;
  }, [emotes]);

  const getEmoteImageUrl = useCallback((emote: EmoteEntry, type: EmoteProvider, size: number = 1): string => {
    switch (type) {
      case 'FFZ':
        return `${BASE_FFZ_EMOTE_CDN}/${emote.id}/${size}`;
      case 'BTTV':
        return `${BASE_BTTV_EMOTE_CDN}/${emote.id}/${size === 4 ? 2 : size}x`;
      case '7TV':
        return `${BASE_7TV_EMOTE_CDN}/${emote.id}/${size}x.webp`;
      default:
        return `${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/${size}.0`;
    }
  }, []);

  const getEmoteImageSrcSet = useCallback((emote: EmoteEntry, type: EmoteProvider): string => {
    switch (type) {
      case 'FFZ':
        return `${BASE_FFZ_EMOTE_CDN}/${emote.id}/1 1x, ${BASE_FFZ_EMOTE_CDN}/${emote.id}/2 2x, ${BASE_FFZ_EMOTE_CDN}/${emote.id}/4 4x`;
      case 'BTTV':
        return `${BASE_BTTV_EMOTE_CDN}/${emote.id}/1x 1x, ${BASE_BTTV_EMOTE_CDN}/${emote.id}/2x 2x, ${BASE_BTTV_EMOTE_CDN}/${emote.id}/3x 3x`;
      case '7TV':
        return `${BASE_7TV_EMOTE_CDN}/${emote.id}/1x.webp 1x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/2x.webp 2x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/3x.webp 3x, ${BASE_7TV_EMOTE_CDN}/${emote.id}/4x.webp 4x`;
      default:
        return `${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/1.0 1x, ${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/2.0 2x, ${BASE_TWITCH_CDN}/emoticons/v2/${emote.id}/default/dark/3.0 4x`;
    }
  }, []);

  const seventvIsZeroWidth = useCallback((emote: EmoteEntry): boolean => {
    const ZERO_WIDTH = 1 << 8;
    return (emote.flags && ZERO_WIDTH) !== 0;
  }, []);

  return {
    emotes,
    emoteLookup,
    getEmoteImageUrl,
    getEmoteImageSrcSet,
    seventvIsZeroWidth,
  };
}
