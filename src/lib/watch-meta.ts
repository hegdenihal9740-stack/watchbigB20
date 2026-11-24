import type { WatchTone } from '@/lib/watches';

export type CardMeta = { list: number };

export const cardMeta: Record<WatchTone, CardMeta> = {
  steel: { list: 14900 },
  black: { list: 16900 },
  gold: { list: 21500 },
  rosegold: { list: 18900 },
};
