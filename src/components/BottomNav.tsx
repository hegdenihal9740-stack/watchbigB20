import { Link } from "@tanstack/react-router";
import { Home, ShoppingBag, UserRound, ShoppingCart } from "lucide-react";
import { cart, useCart } from "@/lib/cart";

export function BottomNav() {
  const { count } = useCart();
  return (
    <nav className="bnav" aria-label="Store navigation">
      <Link
        to="/"
        className="bnav-item"
        activeProps={{ "data-status": "active" }}
        activeOptions={{ exact: true }}
      >
        <Home size={22} />
        <span>Home</span>
      </Link>
      <Link to="/collection" className="bnav-item" activeProps={{ "data-status": "active" }}>
        <ShoppingBag size={22} />
        <span>Shop</span>
      </Link>
      <Link to="/account" className="bnav-item" activeProps={{ "data-status": "active" }}>
        <UserRound size={22} />
        <span>Account</span>
      </Link>
      <button
        type="button"
        className="bnav-item"
        aria-label={count ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
        onClick={() => cart.setOpen(true)}
      >
        <span className="bnav-icon">
          <ShoppingCart size={22} />
          {count > 0 && <span className="bnav-badge">{count}</span>}
        </span>
        <span>Cart</span>
      </button>
    </nav>
  );
}
