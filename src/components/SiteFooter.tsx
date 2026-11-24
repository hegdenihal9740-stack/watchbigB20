import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import bigBLogoDark from "@/assets/big-b-logo-dark.png";
import { cart } from "@/lib/cart";
import { STORE_CONTACT, STORE_CONTACT_EMAIL_URL } from "@/lib/store-info";
import { whatsappContactForPath } from "@/lib/whatsapp";

const linkGroups = [
  {
    title: "Shop",
    links: [
      { label: "Watch collection", to: "/collection" },
      { label: "My account", to: "/account" },
      { label: "Track an order", to: "/account" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact BIG-B", to: "/contact" },
      { label: "Shipping information", to: "/shipping-policy" },
      { label: "Returns & warranty", to: "/returns" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Terms & conditions", to: "/terms" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Shipping policy", to: "/shipping-policy" },
    ],
  },
] as const;

export function SiteFooter({ pathname }: { pathname: string }) {
  const { href: whatsAppHref, watchName } = whatsappContactForPath(pathname);
  const whatsAppLabel = watchName
    ? `Ask about ${watchName} on WhatsApp`
    : `Contact BIG-B on WhatsApp at ${STORE_CONTACT.phone}`;

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <section className="site-footer-brand" aria-labelledby="footer-brand-title">
          <Link to="/" aria-label="BIG-B home">
            <img src={bigBLogoDark} alt="" />
          </Link>
          <h2 id="footer-brand-title">BIG-B Watches</h2>
          <p>Distinctive timepieces, with clear delivery, returns, and warranty support.</p>
          <address className="site-footer-contact">
            <span>
              <MapPin size={16} aria-hidden="true" />
              {STORE_CONTACT.address}
            </span>
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={whatsAppLabel}
            >
              <MessageCircle size={16} aria-hidden="true" />
              {STORE_CONTACT.phone}
            </a>
            <a href={STORE_CONTACT_EMAIL_URL} target="_blank" rel="noopener noreferrer">
              <Mail size={16} aria-hidden="true" />
              {STORE_CONTACT.email}
            </a>
            <span>{STORE_CONTACT.hours}</span>
          </address>
          <div className="site-footer-social">
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={whatsAppLabel}
            >
              {watchName ? "Ask about this watch" : "WhatsApp"}
            </a>
            <a
              href={STORE_CONTACT_EMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email BIG-B"
            >
              Email us
            </a>
          </div>
        </section>

        {linkGroups.map((group) => (
          <nav key={group.title} className="site-footer-group" aria-label={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((item) => (
                <li key={`${item.label}-${item.to}`}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
              {group.title === "Shop" && (
                <li>
                  <button type="button" className="site-footer-link" onClick={() => cart.setOpen(true)}>
                    Cart
                  </button>
                </li>
              )}
            </ul>
          </nav>
        ))}
      </div>

      <div className="site-footer-bottom">
        <p>© {new Date().getFullYear()} BIG-B. All rights reserved.</p>
        <p>
          <ShieldCheck size={16} aria-hidden="true" />
          Secure payments processed by Razorpay
        </p>
      </div>
    </footer>
  );
}
