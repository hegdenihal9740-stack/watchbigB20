import { STORE_CONTACT } from '@/lib/store-info';
import { watches } from '@/lib/watches';

export const DEFAULT_WHATSAPP_MESSAGE = 'Hello BIG-B, I am interested in this watch.';

/** Opens a WhatsApp chat with the store, with the message pre-typed. */
export const whatsappLink = (text = DEFAULT_WHATSAPP_MESSAGE) =>
  `https://wa.me/${STORE_CONTACT.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export function whatsappContactForPath(pathname: string) {
  const watchId = /^\/shop\/([^/]+)\/?$/.exec(pathname)?.[1];
  const watch = watches.find((item) => item.id === watchId);
  const message = watch
    ? `Hi! I'm interested in the BIG-B ${watch.name}. Could you share the current price, live photos, and delivery timeline?`
    : undefined;

  return {
    href: whatsappLink(message),
    watchName: watch?.name,
  };
}
