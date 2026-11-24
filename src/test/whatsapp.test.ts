import { describe, expect, it } from 'vitest';
import { DEFAULT_WHATSAPP_MESSAGE, whatsappContactForPath, whatsappLink } from '@/lib/whatsapp';

describe('WhatsApp contact link', () => {
  it('opens a chat with BIG-B and a pre-filled default message', () => {
    const link = new URL(whatsappLink());

    expect(link.origin + link.pathname).toBe('https://wa.me/918792799090');
    expect(link.searchParams.get('text')).toBe('Hello BIG-B, I am interested in this watch.');
    expect(DEFAULT_WHATSAPP_MESSAGE).toBe(link.searchParams.get('text'));
  });

  it('keeps custom pre-filled messages', () => {
    const link = new URL(whatsappLink('Hello about the steel watch'));

    expect(link.searchParams.get('text')).toBe('Hello about the steel watch');
  });

  it('prefills the current watch name and price from product pages', () => {
    const contact = whatsappContactForPath('/shop/black');
    const link = new URL(contact.href);

    expect(contact.watchName).toBe('Black Skeleton');
    expect(link.searchParams.get('text')).toContain('BIG-B Black Skeleton');
    expect(link.searchParams.get('text')).toContain('current price');
  });

  it('uses the default message outside product pages', () => {
    const contact = whatsappContactForPath('/contact');
    const link = new URL(contact.href);

    expect(contact.watchName).toBeUndefined();
    expect(link.searchParams.get('text')).toBe(DEFAULT_WHATSAPP_MESSAGE);
  });
});
