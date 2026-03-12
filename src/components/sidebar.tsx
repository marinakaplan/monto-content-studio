"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Link2,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  UserCircle,
  BookTemplate,
  FolderSearch,
  Send,
  Swords,
  Palette,
  Lightbulb,
} from "lucide-react";
import { ConnectedAccounts } from "@/components/connected-accounts";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/brief", label: "New Campaign", icon: PlusCircle },
  { href: "/ideate", label: "Ideate", icon: Lightbulb },
  { href: "/brand", label: "Brand DNA", icon: Palette },
  { href: "/creator", label: "Creator Mode", icon: UserCircle },
  { href: "/templates", label: "Templates", icon: BookTemplate },
  { href: "/library", label: "Asset Library", icon: FolderSearch },
  { href: "/publish", label: "Publishing", icon: Send },
  { href: "/competitor", label: "Competitor Intel", icon: Swords },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-white border-r border-[#e6e7eb] flex flex-col z-50 transition-all duration-200"
      style={{ width: collapsed ? 60 : 220 }}
    >
      {/* Logo + collapse toggle */}
      <div
        className={`flex items-center h-16 shrink-0 border-b border-[#e6e7eb] ${
          collapsed ? "justify-center px-0" : "px-4"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <svg
            width={collapsed ? 28 : 32}
            height={collapsed ? 28 : 32}
            viewBox="0 0 508 508"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect width="508" height="508" rx="60" fill="#7B59FF" />
            <path
              d="M227.651 243.494C244.092 216.347 245.366 184.103 244.899 162.182C244.814 157.848 243.03 153.855 239.928 150.881C236.827 147.908 232.706 146.336 228.416 146.378C219.494 146.591 212.442 153.983 212.612 162.861C212.994 180.747 212.102 206.789 200.037 226.755C186.528 249.059 161.463 259.807 123.228 259.595C114.265 259.552 107.042 266.774 107 275.866C107 280.199 108.742 284.235 111.801 287.251C114.859 290.267 118.853 291.839 123.228 291.924C161.505 291.797 186.528 302.46 200.037 324.763C212.102 344.73 212.994 370.772 212.612 388.657C212.442 397.579 219.494 404.971 228.416 405.141C228.543 405.141 228.628 405.141 228.756 405.141C237.507 405.141 244.729 398.131 244.899 389.337C245.366 367.416 244.092 335.171 227.651 308.025C219.452 294.515 208.364 283.682 194.642 275.738C208.406 267.794 219.494 256.961 227.651 243.451V243.494Z"
              fill="white"
            />
            <path
              d="M385.814 216.262H385.729C347.495 216.517 322.43 205.727 308.92 183.423C296.855 163.456 295.963 137.414 296.345 119.529C296.43 115.196 294.858 111.117 291.842 108.016C288.868 104.873 284.833 103.088 280.542 103.003C276.293 102.918 272.13 104.49 269.029 107.506C265.928 110.48 264.143 114.516 264.058 118.807C263.591 140.728 264.866 172.972 281.306 200.119C289.506 213.628 300.594 224.461 314.316 232.406C300.551 240.35 289.506 251.141 281.306 264.693C264.866 291.839 263.591 324.083 264.058 346.005C264.228 354.798 271.45 361.808 280.202 361.808C280.329 361.808 280.457 361.808 280.542 361.808C284.875 361.723 288.868 359.939 291.842 356.838C294.816 353.736 296.43 349.616 296.345 345.325C295.963 327.44 296.855 301.398 308.92 281.431C322.302 259.34 347.07 248.549 384.667 248.549C385.049 248.549 385.474 248.549 385.856 248.549C390.147 248.549 394.183 246.892 397.199 243.876C400.258 240.86 401.957 236.781 402 232.278C401.957 223.399 394.693 216.22 385.856 216.22L385.814 216.262Z"
              fill="white"
            />
          </svg>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-[16px] font-bold text-[#1f2128]">Monto</span>
              <span className="text-[12px] font-medium text-[#7B59FF] -mt-0.5">
                Content Studio
              </span>
            </div>
          )}
        </Link>
        {!collapsed ? (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg text-[#a1a5ae] hover:text-[#545b6d] hover:bg-[#f0f1f3] transition-colors cursor-pointer border-0 bg-transparent"
          >
            <ChevronsLeft size={14} />
          </button>
        ) : (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="absolute top-[18px] -right-3 w-6 h-6 rounded-full bg-white border border-[#e6e7eb] flex items-center justify-center text-[#a1a5ae] hover:text-[#545b6d] hover:bg-[#f0f1f3] transition-colors cursor-pointer shadow-sm z-10"
          >
            <ChevronsRight size={12} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-3 px-2.5 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors no-underline ${
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
              } ${
                active
                  ? "bg-[#EFEBFF] text-[#7B59FF]"
                  : "text-[#545b6d] hover:bg-[#f8f9fb] hover:text-[#1f2128]"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {/* Integrations section */}
        {!collapsed && (
          <>
            <div className="mt-6 mb-1 px-3">
              <span className="text-[10px] font-semibold text-[#a1a5ae] uppercase tracking-wider">
                Integrations
              </span>
            </div>
            <div className="px-1">
              <ConnectedAccounts variant="sidebar" />
            </div>
          </>
        )}
        {collapsed && (
          <div className="mt-4 flex justify-center" title="Integrations">
            <Link2 size={16} className="text-[#a1a5ae]" />
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#e6e7eb] py-2.5 px-2.5 flex flex-col gap-0.5">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors no-underline ${
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
              } ${
                active
                  ? "bg-[#EFEBFF] text-[#7B59FF]"
                  : "text-[#545b6d] hover:bg-[#f8f9fb] hover:text-[#1f2128]"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {/* Profile */}
        <div
          className={`flex items-center gap-2.5 rounded-lg py-2 transition-colors cursor-pointer hover:bg-[#f8f9fb] ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#EFEBFF] flex items-center justify-center text-[12px] font-semibold text-[#7B59FF] shrink-0">
            M
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[#1f2128] truncate">Marina</div>
              <div className="text-[11px] text-[#a1a5ae] truncate">Marketing</div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
