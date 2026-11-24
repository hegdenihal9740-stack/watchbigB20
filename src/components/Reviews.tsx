import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, ImagePlus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isSupabaseConfigured } from "@/lib/supabase-config";
import { AuthLink } from "@/components/AuthLink";
import { useCustomer } from "@/components/CustomerAccounts";

type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at: string;
  photos: string[];
};
const MAX_PHOTOS = 3;
const MAX_BYTES = 5 * 1024 * 1024;

export function Reviews({ tone }: { tone: string }) {
  const [list, setList] = useState<Review[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [stars, setStars] = useState(5);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { user, ready } = useCustomer();
  const signedIn = Boolean(user && !user.is_anonymous);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,author,rating,comment,verified,created_at,photos")
        .eq("product_id", tone)
        .eq("verified", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      const rows = data ?? [];
      setList(rows);
      setLoadError(false);
      const paths = rows.flatMap((r) => r.photos ?? []);
      if (paths.length) {
        const { data: signed, error: imageError } = await supabase.storage
          .from("reviews")
          .createSignedUrls(paths, 3600);
        if (imageError) throw imageError;
        const map: Record<string, string> = {};
        for (const s of signed ?? []) if (s.path && s.signedUrl) map[s.path] = s.signedUrl;
        setUrls(map);
      } else {
        setUrls({});
      }
    } catch (error) {
      console.error("Could not load product reviews.", error);
      setLoadError(true);
      toast.error("Reviews could not be loaded. Please try again.");
    }
  }, [tone]);
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setList([]);
      setUrls({});
      setLoadError(true);
      return;
    }
    void load();
  }, [load]);
  useEffect(() => {
    if (!user) {
      setName("");
      return;
    }
    const meta = user.user_metadata ?? {};
    setName(
      String(meta["display_name"] ?? meta["full_name"] ?? user.email?.split("@")[0] ?? ""),
    );
  }, [user]);

  const pick = (list: FileList | null) => {
    const next = [...files];
    for (const f of Array.from(list ?? [])) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        toast.error(`${f.name} must be a JPEG, PNG or WebP image`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is over 5 MB`);
        continue;
      }
      if (next.length < MAX_PHOTOS) next.push(f);
    }
    setFiles(next);
  };

  const submit = async () => {
    if (!user || user.is_anonymous) {
      toast.error("Sign in with a customer account to post a review.");
      return;
    }
    if (name.trim().length < 1) {
      toast.error("Please add your name");
      return;
    }
    if (text.trim().length < 3) {
      toast.error("Please write a few words");
      return;
    }
    setBusy(true);
    const photos: string[] = [];
    try {
      const { data: u, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const uid = u.user?.id;
      if (!uid) throw new Error("Please sign in again.");
      for (const f of files) {
        const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${uid}/${tone}-${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("reviews")
          .upload(path, f, { contentType: f.type });
        if (error) throw error;
        photos.push(path);
      }
      const { error } = await supabase.from("reviews").insert({
        product_id: tone,
        author: name.trim().slice(0, 60),
        rating: stars,
        comment: text.trim().slice(0, 1000),
        photos,
      });
      if (error) throw error;
      setText("");
      setFiles([]);
      toast.success("Thanks for your review!");
      await load();
    } catch (error) {
      console.error("Could not post product review.", error);
      if (photos.length) {
        try {
          const { error: cleanupError } = await supabase.storage.from("reviews").remove(photos);
          if (cleanupError)
            console.error("Could not clean up review photos after a failed review.", cleanupError);
        } catch (cleanupError) {
          console.error("Could not clean up review photos after a failed review.", cleanupError);
        }
      }
      const detail = error instanceof Error ? error.message : "";
      toast.error(
        /duplicate|unique/i.test(detail)
          ? "You already reviewed this watch"
          : detail || "Could not post review",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="product-section rv">
      <h4>Verified purchase reviews</h4>
      <p className="product-muted">Only reviews linked to a BIG-B order are shown.</p>
      {!ready ? (
        <p className="product-muted">Checking your account…</p>
      ) : signedIn ? (
        <div className="rv-form">
          <div className="rv-stars" role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={stars === s}
                aria-label={`${s} stars`}
                onClick={() => setStars(s)}
              >
                <Star size={22} fill={s <= stars ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <input
            className="shop-input"
            maxLength={60}
            placeholder="Your name"
            aria-label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="shop-input"
            rows={3}
            maxLength={1000}
            placeholder="How does it look and feel?"
            aria-label="Your review"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="rv-photos">
            {files.map((f, i) => (
              <span key={i} className="rv-thumb">
                <img src={URL.createObjectURL(f)} alt="" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {files.length < MAX_PHOTOS && (
              <label className="rv-add">
                <ImagePlus size={18} />
                <span>Add photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  aria-label="Add review photos"
                  onChange={(e) => {
                    pick(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          <button type="button" className="product-cart" disabled={busy} onClick={() => void submit()}>
            {busy ? "Posting…" : "Post review"}
          </button>
        </div>
      ) : (
        <p className="product-muted">
          {user?.is_anonymous ? (
            "Guest checkout sessions cannot post reviews. Sign in with a customer account after your purchase."
          ) : (
            <>
              <AuthLink>Sign in</AuthLink> with your customer account to write a review.
            </>
          )}
        </p>
      )}
      <ul className="rv-list">
        {list.map((r) => (
          <li key={r.id}>
            <p>
              <span className="product-rating-chip">
                {r.rating} <Star size={10} fill="currentColor" />
              </span>{" "}
              <b>{r.author}</b>
              <span className="rv-ver">
                <BadgeCheck size={13} /> Verified buyer
              </span>
            </p>
            <p>{r.comment}</p>
            {r.photos?.length > 0 && (
              <div className="rv-photos">
                {r.photos.map(
                  (p) =>
                    urls[p] && (
                      <button
                        type="button"
                        key={p}
                        className="rv-thumb"
                        onClick={() => setZoom(urls[p]!)}
                        aria-label="View review photo"
                      >
                        <img src={urls[p]} alt={`Photo from ${r.author}`} />
                      </button>
                    ),
                )}
              </div>
            )}
            <p className="product-muted rv-date">
              {new Date(r.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </li>
        ))}
        {loadError ? (
          <li className="product-muted" role="alert">Verified reviews are unavailable right now.</li>
        ) : !list.length ? (
          <li className="product-muted">No verified written reviews yet.</li>
        ) : null}
      </ul>
      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent>
          <DialogTitle className="sr-only">Review photo</DialogTitle>
          {zoom && <img src={zoom} alt="Review photo" className="w-full h-auto" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
