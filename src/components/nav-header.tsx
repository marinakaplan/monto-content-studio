"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PlusCircle } from "lucide-react";
import { ConnectedAccounts } from "@/components/connected-accounts";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brief", label: "New Campaign", icon: PlusCircle },
];

export function NavHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="bg-white border-b border-[#e6e7eb] px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <svg width="28" height="28" viewBox="0 0 508 508" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="508" height="508" rx="60" fill="#7B59FF" />
            <path d="M227.651 243.494C244.092 216.347 245.366 184.103 244.899 162.182C244.814 157.848 243.03 153.855 239.928 150.881C236.827 147.908 232.706 146.336 228.416 146.378C219.494 146.591 212.442 153.983 212.612 162.861C212.994 180.747 212.102 206.789 200.037 226.755C186.528 249.059 161.463 259.807 123.228 259.595C114.265 259.552 107.042 266.774 107 275.866C107 280.199 108.742 284.235 111.801 287.251C114.859 290.267 118.853 291.839 123.228 291.924C161.505 291.797 186.528 302.46 200.037 324.763C212.102 344.73 212.994 370.772 212.612 388.657C212.442 397.579 219.494 404.971 228.416 405.141C228.543 405.141 228.628 405.141 228.756 405.141C237.507 405.141 244.729 398.131 244.899 389.337C245.366 367.416 244.092 335.171 227.651 308.025C219.452 294.515 208.364 283.682 194.642 275.738C208.406 267.794 219.494 256.961 227.651 243.451V243.494Z" fill="white" />
            <path d="M385.814 216.262H385.729C347.495 216.517 322.43 205.727 308.92 183.423C296.855 163.456 295.963 137.414 296.345 119.529C296.43 115.196 294.858 111.117 291.842 108.016C288.868 104.873 284.833 103.088 280.542 103.003C276.293 102.918 272.13 104.49 269.029 107.506C265.928 110.48 264.143 114.516 264.058 118.807C263.591 140.728 264.866 172.972 281.306 200.119C289.506 213.628 300.594 224.461 314.316 232.406C300.551 240.35 289.506 251.141 281.306 264.693C264.866 291.839 263.591 324.083 264.058 346.005C264.228 354.798 271.45 361.808 280.202 361.808C280.329 361.808 280.457 361.808 280.542 361.808C284.875 361.723 288.868 359.939 291.842 356.838C294.816 353.736 296.43 349.616 296.345 345.325C295.963 327.44 296.855 301.398 308.92 281.431C322.302 259.34 347.07 248.549 384.667 248.549C385.049 248.549 385.474 248.549 385.856 248.549C390.147 248.549 394.183 246.892 397.199 243.876C400.258 240.86 401.957 236.781 402 232.278C401.957 223.399 394.693 216.22 385.856 216.22L385.814 216.262Z" fill="white" />
          </svg>
          <span className="text-[15px] font-bold text-[#1f2128]">Monto</span>
          <span className="text-[13px] font-medium text-[#7B59FF]">
            Content Studio
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-[#e6e7eb]" />

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors no-underline ${
                  active
                    ? "bg-[#EFEBFF] text-[#7B59FF]"
                    : "text-[#545b6d] hover:bg-[#f8f9fb] hover:text-[#1f2128]"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Connected Accounts + Avatar */}
      <div className="flex items-center gap-3">
        <ConnectedAccounts />
        <div className="w-[32px] h-[32px] rounded-full bg-[#EFEBFF] flex items-center justify-center text-sm font-semibold text-[#7B59FF]">
          M
        </div>
      </div>
    </header>
  );
}
