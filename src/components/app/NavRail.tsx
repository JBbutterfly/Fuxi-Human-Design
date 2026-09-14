"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, IconButton, type IconName } from "@/components/ui";

const ITEMS: [string, string, IconName][] = [
  ["/chart", "Chart", "compass"],
  ["/gates", "Gates", "grid-3x3"],
  ["/elements", "Elements", "circle-dot"],
  ["/dashboard", "Connections", "users"],
  ["/notes", "Notes", "notebook-pen"],
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 64,
        flex: "0 0 auto",
        borderRight: "1px solid var(--border-hairline)",
        background: "var(--bg-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--sp-4)",
        padding: "var(--sp-5) 0",
      }}
    >
      <Link href="/chart" style={{ borderBottom: "none", marginBottom: "var(--sp-6)", marginTop: "var(--sp-2)" }}>
        <Image
          src="/brand/app-icon.svg"
          alt="Fuxi — home"
          width={32}
          height={32}
          style={{ borderRadius: "22.37%", display: "block" }}
        />
      </Link>
      {ITEMS.map(([href, label, icon]) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} style={{ borderBottom: "none" }}>
            <IconButton label={label} active={active}>
              <Icon name={icon} size={18} />
            </IconButton>
          </Link>
        );
      })}
      <div style={{ flex: 1 }} />
      <Link href="/settings" style={{ borderBottom: "none" }}>
        <IconButton label="Settings" active={pathname === "/settings"}>
          <Icon name="settings" size={18} />
        </IconButton>
      </Link>
    </nav>
  );
}
