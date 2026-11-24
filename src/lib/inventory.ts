import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-config";

export type Stock = Record<string, number>;
export type StockState = {
  data: Stock | null;
  loading: boolean;
};

export async function loadStock(): Promise<Stock> {
  if (!isSupabaseConfigured()) return {};
  const { data, error } = await supabase.from("inventory").select("watch_id, stock");
  if (error) {
    console.error("Could not load inventory.", error);
    throw new Error("Could not load current stock.");
  }
  return Object.fromEntries((data ?? []).map((r) => [r.watch_id, r.stock])) as Stock;
}
export function useStock() {
  const [state, setState] = useState<StockState>({ data: null, loading: true });
  useEffect(() => {
    let on = true;
    void loadStock().then(
      (v) => {
        if (on) setState({ data: v, loading: false });
      },
      (error: unknown) => {
        if (!on) return;
        console.error("Stock availability is temporarily unknown.", error);
        setState({ data: null, loading: false });
      },
    );
    return () => {
      on = false;
    };
  }, []);
  return state;
}
export const stockLabel = (n: number | undefined) =>
  n === undefined ? "" : n <= 0 ? "Out of stock" : n <= 3 ? `Only ${n} left` : "In stock";
