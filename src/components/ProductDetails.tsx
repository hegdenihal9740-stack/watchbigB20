import {
  ShoppingCart,
  Zap,
  ShieldCheck,
  RotateCcw,
  Truck,
  MapPin,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useWishlist, wishlist } from "@/lib/wishlist";
import { useStock, stockLabel } from "@/lib/inventory";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";
import { Reviews } from "@/components/Reviews";
import steelJpg from "@/assets/watch-steel-gallery.webp";
import blackJpg from "@/assets/watch-black-gallery.webp";
import goldJpg from "@/assets/watch-gold-gallery.webp";
import roseJpg from "@/assets/watch-rosegold-gallery.webp";
import steelTry from "@/assets/try-on-steel.webp";
import blackTry from "@/assets/try-on-black.webp";
import goldTry from "@/assets/try-on-gold.webp";
import roseTry from "@/assets/try-on-rosegold.webp";
import steelHand from "@/assets/hand-steel.webp";
import blackHand from "@/assets/hand-black.webp";
import goldHand from "@/assets/hand-gold.webp";
import roseHand from "@/assets/hand-rosegold.webp";
import steelLife from "@/assets/lifestyle-steel.webp";
import blackLife from "@/assets/lifestyle-black.webp";
import goldLife from "@/assets/lifestyle-gold.webp";
import roseLife from "@/assets/lifestyle-rosegold.webp";
import steelCoverThumb from "@/assets/product-gallery-thumbnails/steel-watch-cover.webp";
import blackCoverThumb from "@/assets/product-gallery-thumbnails/black-watch-cover.webp";
import goldCoverThumb from "@/assets/product-gallery-thumbnails/gold-watch-cover.webp";
import roseCoverThumb from "@/assets/product-gallery-thumbnails/rosegold-watch-cover.webp";
import steelLifeThumb from "@/assets/product-gallery-thumbnails/steel-lifestyle.webp";
import blackLifeThumb from "@/assets/product-gallery-thumbnails/black-lifestyle.webp";
import goldLifeThumb from "@/assets/product-gallery-thumbnails/gold-lifestyle.webp";
import roseLifeThumb from "@/assets/product-gallery-thumbnails/rosegold-lifestyle.webp";
import steelHandThumb from "@/assets/product-gallery-thumbnails/steel-hand.webp";
import blackHandThumb from "@/assets/product-gallery-thumbnails/black-hand.webp";
import goldHandThumb from "@/assets/product-gallery-thumbnails/gold-hand.webp";
import roseHandThumb from "@/assets/product-gallery-thumbnails/rosegold-hand.webp";
import steelDetailThumb from "@/assets/product-gallery-thumbnails/steel-watch-detail.webp";
import blackDetailThumb from "@/assets/product-gallery-thumbnails/black-watch-detail.webp";
import goldDetailThumb from "@/assets/product-gallery-thumbnails/gold-watch-detail.webp";
import roseDetailThumb from "@/assets/product-gallery-thumbnails/rosegold-watch-detail.webp";
import steelTryThumb from "@/assets/product-gallery-thumbnails/steel-try-on.webp";
import blackTryThumb from "@/assets/product-gallery-thumbnails/black-try-on.webp";
import goldTryThumb from "@/assets/product-gallery-thumbnails/gold-try-on.webp";
import roseTryThumb from "@/assets/product-gallery-thumbnails/rosegold-try-on.webp";
import { cardMeta } from "@/lib/watch-meta";
const life: Record<string, string> = {
  steel: steelLife,
  black: blackLife,
  gold: goldLife,
  rosegold: roseLife,
};

const extra: Record<WatchTone, string[]> = {
  steel: [steelHand, steelJpg, steelTry],
  black: [blackHand, blackJpg, blackTry],
  gold: [goldHand, goldJpg, goldTry],
  rosegold: [roseHand, roseJpg, roseTry],
};
const galleryThumbByImage: Record<string, string> = {
  [watchImages.steel]: steelCoverThumb,
  [watchImages.black]: blackCoverThumb,
  [watchImages.gold]: goldCoverThumb,
  [watchImages.rosegold]: roseCoverThumb,
  [steelLife]: steelLifeThumb,
  [blackLife]: blackLifeThumb,
  [goldLife]: goldLifeThumb,
  [roseLife]: roseLifeThumb,
  [steelHand]: steelHandThumb,
  [blackHand]: blackHandThumb,
  [goldHand]: goldHandThumb,
  [roseHand]: roseHandThumb,
  [steelJpg]: steelDetailThumb,
  [blackJpg]: blackDetailThumb,
  [goldJpg]: goldDetailThumb,
  [roseJpg]: roseDetailThumb,
  [steelTry]: steelTryThumb,
  [blackTry]: blackTryThumb,
  [goldTry]: goldTryThumb,
  [roseTry]: roseTryThumb,
};
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cart, getProductPrice } from "@/lib/cart";
import { watchImages, watches, type WatchTone } from "@/lib/watches";

const usd = (n: number) => n.toLocaleString("en-IN");
const isCaseSizeSpec = (spec: string) =>
  /^\d+(?:\.\d+)?\s*mm\s+case(?:\s+size)?\b|^case\s+size\b/i.test(spec.trim());

export function ProductDetails({
  tone,
  open,
  onOpenChange,
  asPage = false,
  onBuy,
  onSelectWatch,
}: {
  tone: WatchTone;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  asPage?: boolean;
  onBuy?: (id: WatchTone) => void;
  onSelectWatch?: (id: WatchTone) => void;
}) {
  const Title = asPage ? "h1" : DialogTitle;
  const Desc = asPage ? "p" : DialogDescription;
  const [pick, setPick] = useState<WatchTone | null>(null);
  const active = pick ?? tone;
  const m = cardMeta[active];
  const w = watches.find((x) => x.id === active)!;
  const specs = w.details.flatMap((value) =>
    isCaseSizeSpec(value) ? [] : [{ label: "Feature", value }],
  );
  const caseSizeSpec = w.details.find(isCaseSizeSpec);
  const waterResistanceSpec = w.details.find((spec) => /water resistant/i.test(spec));
  const productImages =
    "images" in w && Array.isArray(w.images)
      ? w.images.filter((image): image is string => typeof image === "string" && image.length > 0)
      : [];
  const inventory = useStock();
  const stock = inventory.data;
  const left = stock?.[active];
  const price = getProductPrice(w.id);
  const sold =
    price === undefined ||
    inventory.loading ||
    stock === null ||
    left === undefined ||
    left <= 0;
  const priceLabel = price === undefined ? "Price unavailable" : `₹${usd(price)}`;
  const wish = useWishlist();
  const defaultImages = [
    w.image,
    ...(life[w.id] ? [life[w.id]!] : []),
    ...(extra[w.id] ?? []),
  ];
  const imgs = [...new Set([...productImages, ...defaultImages])];
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const isNearSlide = (i: number) => {
    const distance = Math.abs(i - idx);
    return distance <= 1 || distance === imgs.length - 1;
  };
  const off = price === undefined ? 0 : Math.round((1 - price / m.list) * 100);
  const deliveryEstimate = "3–5 business days";
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const checkPincode = () => {
    if (pincode.length !== 6) {
      setPinMsg({ ok: false, text: "Please enter a valid 6-digit pincode" });
      return;
    }
    setPinMsg({
      ok: true,
      text: `Free delivery to ${pincode} in 3–5 business days. Remote areas may take up to 7 business days.`,
    });
  };
  const table: [string, string][] = [
    ["Model Name", `BIG-B ${w.name}`],
    ["Strap / Case Finish", w.finish],
    ...(caseSizeSpec ? [["Case Size", caseSizeSpec] as [string, string]] : []),
    ...(waterResistanceSpec
      ? [["Water Resistance", waterResistanceSpec] as [string, string]]
      : []),
    ["Display Type", "Analog"],
    ...specs
      .filter(({ value }) => value !== waterResistanceSpec)
      .map(({ label, value }) => [label, value] as [string, string]),
    ["Warranty", "2 Years manufacturer warranty"],
  ];
  useEffect(() => {
    if (!open) setPick(null);
  }, [open]);
  useEffect(() => {
    setIdx(0);
    setZoom(false);
    sliderRef.current?.scrollTo({ left: 0 });
  }, [active]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slideTo = (i: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const n = (i + imgs.length) % imgs.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
    setIdx(n);
    setZoom(false);
  };
  const onSlide = () => {
    const el = sliderRef.current;
    if (!el) return;
    const n = Math.round(el.scrollLeft / el.clientWidth);
    if (n !== idx) setIdx(n);
  };
  const press = useRef({ x: 0, y: 0, moved: false });
  const toggleImageZoom = (i: number) => {
    if (press.current.moved) return;
    if (i !== idx) {
      slideTo(i);
      return;
    }
    setZoom((current) => !current);
  };
  const actionsRef = useRef<HTMLDivElement>(null);

  const [showSticky, setShowSticky] = useState(true);
  const stickyAvailability =
    price === undefined
      ? "Price unavailable"
      : inventory.loading
        ? "Checking availability…"
        : stock === null || left === undefined
          ? "Stock status unavailable"
          : left <= 0
            ? "Out of stock"
            : `${off}% off · Free delivery`;
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || !asPage) return;
    let frame = 0;
    const updateVisibility = () => {
      frame = 0;
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const nav = mobile ? document.querySelector<HTMLElement>(".bnav") : null;
      const navTop =
        nav && getComputedStyle(nav).display !== "none"
          ? nav.getBoundingClientRect().top
          : window.innerHeight;
      const stickyBar = document.querySelector<HTMLElement>(".product-sticky");
      const stickyBounds = stickyBar?.getBoundingClientRect();
      const stickyBottom = stickyBounds?.bottom ?? (mobile ? navTop - 6 : window.innerHeight - 20);
      const stickyTop = stickyBounds?.top ?? stickyBottom - (mobile ? 64 : 68);
      const actionsBounds = el.getBoundingClientRect();
      const footer = document.querySelector<HTMLElement>(".site-footer");
      const footerBounds = footer?.getBoundingClientRect();
      const actionsFullyVisible =
        actionsBounds.top >= 0 && actionsBounds.bottom <= stickyTop;
      const footerOverlapsStickyBar = Boolean(
        footerBounds &&
          footerBounds.top < stickyBottom &&
          footerBounds.bottom > stickyTop,
      );
      setShowSticky(!actionsFullyVisible && !footerOverlapsStickyBar);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateVisibility);
    };
    const page = el.closest<HTMLElement>(".shop-page");
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    if (page) resizeObserver.observe(page);
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [asPage]);
  const buyNow = () => {
    if (price === undefined) {
      toast.error("This watch's price is unavailable. Please refresh the collection.");
      return;
    }
    if (onBuy) {
      onBuy(w.id);
      return;
    }
    cart.add(w.id);
    toast.success("Proceeding to checkout");
    onOpenChange(false);
  };
  const addCart = () => {
    if (price === undefined) {
      toast.error("This watch's price is unavailable. Please refresh the collection.");
      return;
    }
    cart.add(w.id);
    toast.success(`${w.name} added to cart`);
  };
  return (
    <>
      {(() => {
        const body = (
          <div className="product-grid">
            <div className="product-left">
              <span className="product-index">
                {String(idx + 1).padStart(2, "0")} / {String(imgs.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                className={`product-wish ${wish.includes(w.id) ? "is-on" : ""}`}
                aria-label="Add to wishlist"
                onClick={() =>
                  toast.success(
                    wishlist.toggle(w.id) ? "Added to wishlist" : "Removed from wishlist",
                  )
                }
              >
                <Heart size={18} fill={wish.includes(w.id) ? "currentColor" : "none"} />
              </button>
              <div
                className="product-slider-wrap"
                onPointerDown={(e) => {
                  press.current = { x: e.clientX, y: e.clientY, moved: false };
                }}
                onPointerMove={(e) => {
                  if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 10)
                    press.current.moved = true;
                }}
              >
                <div className="product-slider" ref={sliderRef} onScroll={onSlide}>
                  {imgs.map((src, i) => (
                    <div
                      key={`${i}-${src}`}
                      className={`product-imgbox product-slide is-zoomable ${i === idx ? "is-active" : ""} ${i === idx && zoom ? "is-zoomed" : ""}`}
                      onClick={() => toggleImageZoom(i)}
                    >
                      <img
                        src={src}
                        alt={`${w.name} — product photo ${i + 1} of ${imgs.length}`}
                        draggable={false}
                        loading={isNearSlide(i) ? "eager" : "lazy"}
                        fetchPriority={i === idx ? "high" : "auto"}
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
                <div className="product-dots" aria-hidden="true">
                  {imgs.map((src, i) => (
                    <span key={src} className={i === idx ? "is-on" : ""} />
                  ))}
                </div>
              </div>
              <div className="product-thumbs">
                {imgs.map((src, i) => (
                  <button
                    type="button"
                    key={`${i}-${src}`}
                    className={`product-thumb ${i === idx ? "is-active" : ""}`}
                    aria-label={`View ${w.name} photo ${i + 1} of ${imgs.length}`}
                    aria-pressed={i === idx}
                    onClick={() => slideTo(i)}
                  >
                    <img
                      src={galleryThumbByImage[src] ?? src}
                      alt=""
                      loading={i === idx ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="product-right">
              <p className="product-brand">BIG-B · {w.finish}</p>
              <Title className="product-title">{w.name}</Title>
              <p className="product-subtitle">{w.details.slice(0, 2).join(" · ")}</p>
              <p className="product-special">Special Price</p>
              <div className="product-price-row">
                <span className="product-price">{priceLabel}</span>
                <s className="product-muted">₹{usd(m.list)}</s>
                <span className="product-off">{off}% off</span>
              </div>
              <div className="product-delivery">
                <div className="product-pincode">
                  <MapPin size={16} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter delivery pincode"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ""));
                      setPinMsg(null);
                    }}
                    aria-label="Delivery pincode"
                  />
                  <button type="button" onClick={checkPincode}>
                    Check
                  </button>
                </div>
                {pinMsg && (
                  <p className={`product-pin-msg ${pinMsg.ok ? "is-ok" : "is-err"}`}>
                    {pinMsg.text}
                  </p>
                )}
                <div className="product-delivery-row">
                  <Truck size={16} />
                  <span>
                    Estimated delivery <b>{deliveryEstimate}</b>{" "}
                    <span className="product-delivery-free">| Free</span>
                  </span>
                </div>
                <div className="product-delivery-row">
                  <RotateCcw size={16} />
                  <span>
                    <b>7 days</b> Replacement Policy
                  </span>
                </div>
                <div className="product-delivery-row">
                  <ShieldCheck size={16} />
                  <span>
                    <b>2 Year</b> Manufacturer Warranty
                  </span>
                </div>
              </div>
              {inventory.loading ? (
                <p className="product-muted" role="status">Checking current stock…</p>
              ) : stock === null ? (
                <p className="product-pin-msg is-err" role="alert">
                  Current stock could not be checked. Please retry or contact BIG-B before ordering.
                </p>
              ) : (
                <p
                  className={
                    sold
                      ? "product-pin-msg is-err"
                      : left !== undefined && left <= 3
                        ? "product-pin-msg is-err"
                        : "product-pin-msg is-ok"
                  }
                >
                  {left === undefined ? "Stock status unavailable" : stockLabel(left)}
                </p>
              )}
              <div className="product-actions" ref={actionsRef}>
                <button type="button" className="product-buy" disabled={sold} onClick={buyNow}>
                  <Zap size={16} /> Buy now
                </button>
                <button type="button" className="product-cart" disabled={sold} onClick={addCart}>
                  <ShoppingCart size={16} /> Add to cart
                </button>
              </div>
              <a
                className="product-wa"
                href={whatsappLink(
                  `Hi! I'm interested in the BIG-B ${w.name} (${priceLabel}). Can you share live photos and the delivery timeline?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} /> Ask or order on WhatsApp
              </a>
              {asPage && showSticky && (
                <div className="product-sticky">
                  <span className="product-sticky-price">
                    <b>{priceLabel}</b>
                    <small aria-live="polite">{stickyAvailability}</small>
                  </span>
                  <button type="button" className="product-cart" disabled={sold} onClick={addCart}>
                    Add to cart
                  </button>
                  <button type="button" className="product-buy" disabled={sold} onClick={buyNow}>
                    Buy now
                  </button>
                </div>
              )}
              <div className="product-trust">
                <div className="product-trust-card t-green">
                  <Truck size={22} />
                  <b>Free Delivery</b>
                  <span>{deliveryEstimate}</span>
                </div>
                <div className="product-trust-card t-blue">
                  <RotateCcw size={22} />
                  <b>7 Days</b>
                  <span>Easy replacement</span>
                </div>
                <div className="product-trust-card t-gold">
                  <ShieldCheck size={22} />
                  <b>2 Year</b>
                  <span>Warranty</span>
                </div>
              </div>
              <div className="product-assure">
                <ShieldCheck size={16} /> UPI payments are processed by Razorpay. Payment is verified before an online order is confirmed.
              </div>
              <div className="product-section">
                <h4>The story</h4>
                <Desc className="product-desc">{w.description}</Desc>
              </div>
              <div className="product-section">
                <h4>Highlights</h4>
                <ul className="product-highlights">
                  {w.details.map((d, i) => (
                    <li key={`${i}-${d}`}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className="product-section">
                <h4>Shipping &amp; returns</h4>
                <p className="product-desc">
                  Free delivery and a 7-day replacement policy. Review the details before ordering.
                </p>
                <div className="product-policy-links">
                  <Link to="/shipping-policy">Shipping policy</Link>
                  <Link to="/returns">Returns &amp; refunds</Link>
                </div>
              </div>
              <div className="product-section">
                <h4>Specifications</h4>
                <dl className="product-table">
                  {table.map(([k, v], i) => (
                    <div key={`${i}-${k}-${v}`}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Reviews tone={active} />
              <div className="product-section">
                <h4>You may also like</h4>
                <div className="product-recs">
                  {[...new Map(watches.map((watch) => [watch.id, watch])).values()]
                    .filter((r) => r.id !== active)
                    .map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        className="product-rec"
                        onClick={(e) => {
                          (e.currentTarget as HTMLButtonElement).blur();
                          if (onSelectWatch) onSelectWatch(r.id);
                          else setPick(r.id);
                          requestAnimationFrame(() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            const b = document.querySelector(
                              ".product-panel",
                            ) as HTMLElement | null;
                            b?.scrollTo({ top: 0, behavior: "smooth" });
                          });
                        }}
                      >
                        <img src={r.image} alt={r.name} loading="lazy" decoding="async" />
                        <span className="product-rec-name">{r.name}</span>
                        <span className="product-rec-sub">{r.finish}</span>
                        <span className="product-rec-price">
                          ₹
                          {getProductPrice(r.id) === undefined
                            ? "Unavailable"
                            : usd(getProductPrice(r.id)!)}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
        return asPage ? (
          <div className="product-panel product-page">{body}</div>
        ) : (
          <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="product-panel">{body}</DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}
