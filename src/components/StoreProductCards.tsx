import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ScanLine, Search } from "lucide-react";
import { toast } from "sonner";
import { cart, getProductPrice } from "@/lib/cart";
import { watches, type WatchTone } from "@/lib/watches";
import { ensureProducts, isBuiltIn } from "@/lib/products";
import { useStock } from "@/lib/inventory";

const usd = (n: number) => n.toLocaleString("en-IN");

export function WatchProductCard({
  tone,
  priority = false,
  stock,
  stockLoading,
  inventoryReady,
}: {
  tone: WatchTone;
  priority?: boolean;
  stock: number | undefined;
  stockLoading: boolean;
  inventoryReady: boolean;
}) {
  const w = watches.find((x) => x.id === tone);
  if (!w) return null;
  const price = getProductPrice(w.id);
  const unavailable =
    price === undefined || stockLoading || !inventoryReady || stock === undefined || stock <= 0;
  const stockLabel = stockLoading
    ? "Checking availability…"
    : !inventoryReady || stock === undefined
      ? "Stock status unavailable"
      : stock <= 0
        ? "Out of stock"
        : stock <= 3
          ? `Only ${stock} left`
          : "In stock";
  const image = w.image;
  return (
    <article className="store-card-card">
      <Link to="/shop/$watchId" params={{ watchId: w.id }} className="store-card-img">
        <img
          src={image}
          alt={w.name}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </Link>
      <div className="store-card-body">
        <p className="store-card-eyebrow">BIG-B · {w.finish}</p>
        <Link to="/shop/$watchId" params={{ watchId: w.id }} className="store-card-title">
          {w.name}
        </Link>
        <p className="store-card-specs">{w.details.join(" · ")}</p>
        <div className="store-card-price-row">
          <span className="store-card-price">
            ₹{price === undefined ? "Unavailable" : usd(price)}
          </span>
        </div>
        <p className="store-card-small store-card-muted">Free delivery · 3–5 business days</p>
        <p className="store-card-small store-card-muted" aria-live="polite">
          {stockLabel}
        </p>
        <div className="store-card-links">
          {isBuiltIn(w.id) && (
            <Link
              to="/watches/$watchId"
              params={{ watchId: w.id }}
              search={{ tryon: true }}
              className="store-card-tryon"
            >
              <ScanLine size={14} /> Try on
            </Link>
          )}
          <Link to="/shop/$watchId" params={{ watchId: w.id }} className="store-card-more">
            Details
          </Link>
        </div>
        <button
          type="button"
          className="store-card-add"
          disabled={unavailable}
          onClick={() => {
            cart.add(w.id);
            toast.success(`${w.name} added to cart`);
          }}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

const filters: { id: "all" | WatchTone; label: string }[] = [
  { id: "all", label: "All" },
  { id: "steel", label: "Stainless Steel" },
  { id: "black", label: "Midnight Black" },
  { id: "gold", label: "Classic Gold" },
  { id: "rosegold", label: "Rose Gold" },
];
type Sort = "name" | "low" | "high" | "new";

export function StoreProductCards() {
  const inventory = useStock();
  const [filter, setFilter] = useState<"all" | WatchTone>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("name");
  const [catalog, setCatalog] = useState([...watches]);
  const [catalogError, setCatalogError] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const catalogRequest = useRef(false);
  const mounted = useRef(true);
  const refreshCatalog = useCallback(async () => {
    if (catalogRequest.current) return;
    catalogRequest.current = true;
    setLoadingCatalog(true);
    try {
      const loaded = await ensureProducts(true);
      if (!mounted.current) return;
      if (!loaded) {
        setCatalogError("Products could not be refreshed. Check your connection and try again.");
        return;
      }
      setCatalogError("");
      setCatalog([...watches]);
    } catch (error) {
      console.error("[Products] Could not refresh the collection", error);
      if (mounted.current) {
        setCatalogError("Products could not be refreshed. Check your connection and try again.");
      }
    } finally {
      catalogRequest.current = false;
      if (mounted.current) setLoadingCatalog(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshCatalog();
    };
    void refreshCatalog();
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      mounted.current = false;
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshCatalog]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const found = [...new Map(catalog.map((watch) => [watch.id, watch])).values()]
      .map((w, i) => ({ w, i }))
      .filter(
        ({ w }) =>
          (filter === "all" || w.id === filter) &&
          (!term || [w.name, w.finish, ...w.details].join(" ").toLowerCase().includes(term)),
      );
    const by: Record<Sort, (a: (typeof found)[number], b: (typeof found)[number]) => number> = {
      name: (a, b) => a.w.name.localeCompare(b.w.name),
      low: (a, b) =>
        (getProductPrice(a.w.id) ?? Number.MAX_SAFE_INTEGER) -
        (getProductPrice(b.w.id) ?? Number.MAX_SAFE_INTEGER),
      high: (a, b) =>
        (getProductPrice(b.w.id) ?? Number.MAX_SAFE_INTEGER) -
        (getProductPrice(a.w.id) ?? Number.MAX_SAFE_INTEGER),
      new: (a, b) => b.i - a.i,
    };
    return found.sort(by[sort]).map(({ w }) => w);
  }, [catalog, filter, q, sort]);
  return (
    <section className="store-card-section" aria-labelledby="store-card-title">
      <div className="store-card-container">
        <h2 id="store-card-title">Shop the collection</h2>
        {catalogError && (
          <p className="store-card-muted" role="alert">
            {catalogError}{" "}
            <button
              type="button"
              className="store-card-chip"
              disabled={loadingCatalog}
              onClick={() => void refreshCatalog()}
            >
              {loadingCatalog ? "Refreshing…" : "Try again"}
            </button>
          </p>
        )}
        <div className="store-card-tools">
          <label className="store-card-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search name, finish, features…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search watches"
            />
          </label>
          <select
            className="store-card-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort by"
          >
            <option value="name">Name: A to Z</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="new">Newest</option>
          </select>
        </div>
        <div className="store-card-chips" role="group" aria-label="Filter by finish">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              className={`store-card-chip ${filter === f.id ? "is-on" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {list.length ? (
          <div className="store-card-grid">
            {list.map((w, index) => (
              <WatchProductCard
                key={w.id}
                tone={w.id}
                priority={index < 2}
                stock={inventory.data?.[w.id]}
                stockLoading={inventory.loading}
                inventoryReady={inventory.data !== null}
              />
            ))}
          </div>
        ) : (
          <p className="store-card-muted">
            No watches match.{" "}
            <button
              type="button"
              className="store-card-chip"
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
