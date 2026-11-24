import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ProductDetails } from "@/components/ProductDetails";
import { ShopHeader } from "@/components/ShopHeader";
import { ensureProducts } from "@/lib/products";
import { getProductPrice } from "@/lib/cart";
import { watchImages, watches, type WatchTone } from "@/lib/watches";

export const Route = createFileRoute("/shop/$watchId")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    await ensureProducts();
    if (!watches.some((w) => w.id === params.watchId)) throw notFound();
  },
  head: ({ params }) => {
    const w = watches.find((x) => x.id === params.watchId);
    const image = w ? watchImages[w.id] : undefined;
    const socialImage = image
      ? new URL(image, "https://big-b-watch-boutique.lovable.app").href
      : undefined;
    const price = w ? getProductPrice(w.id) : undefined;
    const title = `Buy ${w?.name ?? "Watch"} — BIG-B`;
    const description = `Shop ${w?.name ?? "our watches"}: price, delivery, sizes, specifications and secure checkout.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(socialImage ? [{ property: "og:image", content: socialImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(socialImage ? [{ name: "twitter:image", content: socialImage }] : []),
        ...(w
          ? [
              {
                "script:ld+json": {
                  "@context": "https://schema.org",
                  "@type": "Product",
                  name: w.name,
                  description: w.description,
                  sku: w.id,
                  image: socialImage,
                  brand: { "@type": "Brand", name: "BIG-B" },
                  ...(price !== undefined
                    ? {
                        offers: {
                          "@type": "Offer",
                          priceCurrency: "INR",
                          price: price.toString(),
                        },
                      }
                    : {}),
                },
              },
            ]
          : []),
      ],
    };
  },
  component: ShopPage,
});

function ShopPage() {
  const { watchId } = Route.useParams();
  const navigate = useNavigate();
  return (
    <main className="shop-page">
      <ShopHeader />
      <ProductDetails
        key={watchId}
        tone={watchId as WatchTone}
        open
        asPage
        onOpenChange={() => {}}
        onSelectWatch={(id) => void navigate({ to: "/shop/$watchId", params: { watchId: id } })}
        onBuy={(id) => void navigate({ to: "/checkout", search: { item: id } })}
      />
    </main>
  );
}
