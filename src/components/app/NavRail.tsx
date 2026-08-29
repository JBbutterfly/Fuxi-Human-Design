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
      <Image
        src="/brand/app-icon.svg"
        alt="Fuxi"
        width={32}
        height={32}
        style={{ borderRadius: "22.37%", marginBottom: "var(--sp-6)", marginTop: "var(--sp-2)", pointerEvents: "none" }}
      />
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
      {/* Notes has no feature behind it yet — present in chrome, inert like Settings below. */}
      <IconButton label="Notes">
        <Icon name="notebook-pen" size={18} />
      </IconButton>
      <div style={{ flex: 1 }} />
      <IconButton label="Settings">
        <Icon name="settings" size={18} />
      </IconButton>
    </nav>
  );
}
