import { createFileRoute } from "@tanstack/react-router";
import { StoreProductCards } from "@/components/StoreProductCards";
import { ShopHeader } from "@/components/ShopHeader";
import { watches, watchImages, watchThumbnails } from "@/lib/watches";

export const Route = createFileRoute("/collection")({
  ssr: false,
  head: () => {
    const socialImage = new URL(watchImages.steel, "https://big-b-watch-boutique.lovable.app")
      .href;
    return {
      meta: [
        { title: "Shop the Collection — BIG-B" },
        {
          name: "description",
          content:
            "Browse every BIG-B watch: steel, black, gold and rose gold — with current prices, availability and delivery information.",
        },
        { property: "og:title", content: "Shop the Collection — BIG-B" },
        {
          property: "og:description",
          content:
            "Browse every BIG-B watch: steel, black, gold and rose gold — with current prices, availability and delivery information.",
        },
        { property: "og:image", content: socialImage },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: socialImage },
        {
          "script:ld+json": {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "BIG-B Watch Collection",
            itemListElement: watches.map((watch, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: watch.name,
              url: `https://big-b-watch-boutique.lovable.app/shop/${watch.id}`,
              image: new URL(
                watchThumbnails[watch.id],
                "https://big-b-watch-boutique.lovable.app",
              ).href,
            })),
          },
        },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  return (
    <main className="shop-page">
      <ShopHeader />
      <StoreProductCards />
    </main>
  );
}
