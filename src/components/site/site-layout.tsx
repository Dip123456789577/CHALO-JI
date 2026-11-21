import type { ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { CartDrawer } from "./cart-drawer";
import { SearchOverlay } from "./search-overlay";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F5F0] text-[#111111]">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
}
