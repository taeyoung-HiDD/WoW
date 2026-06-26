"use client";

import type { AppView } from "@/lib/types";
import { BrandLogo } from "./BrandLogo";
import { PlusIcon, UsersIcon } from "./icons";

interface HeaderProps {
  view: AppView;
  todayStr: string;
  currentUserName: string;
  isAdmin: boolean;
  pendingCount: number;
  onViewChange: (view: AppView) => void;
  onOpenUserPanel: () => void;
  onLogout: () => void;
  onAddProject: () => void;
}

export function Header({
  view,
  todayStr,
  currentUserName,
  isAdmin,
  pendingCount,
  onViewChange,
  onOpenUserPanel,
  onLogout,
  onAddProject,
}: HeaderProps) {
  const tabClass = (v: AppView) =>
    `text-[13px] px-3.5 py-1.5 rounded-[7px] transition-all ${
      view === v
        ? "font-semibold text-hub-primary bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07)]"
        : "font-medium text-hub-secondary"
    }`;

  return (
    <header className="sticky top-0 z-[100] bg-white/96 backdrop-blur-[10px] border-b border-hub-border h-[58px] flex items-center px-7 gap-3.5">
      <div className="flex items-center gap-2.5 shrink-0">
        <BrandLogo variant="icon" />
        <span className="text-base font-bold tracking-tight text-hub-text">
          HiDD WoW
        </span>
      </div>

      <div className="flex gap-0.5 bg-hub-surface rounded-[10px] p-1 shrink-0">
        <button onClick={() => onViewChange("dashboard")} className={tabClass("dashboard")}>
          대시보드
        </button>
        <button onClick={() => onViewChange("archive")} className={tabClass("archive")}>
          아카이브
        </button>
      </div>

      <div className="flex-1" />

      <div className="text-[13px] text-hub-secondary bg-hub-surface px-3.5 py-1.5 rounded-full shrink-0">
        {todayStr}
      </div>

      {isAdmin && (
        <button
          onClick={onOpenUserPanel}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-hub-primary bg-hub-surface border border-[#E8D9A8] rounded-lg px-3.5 h-9 shrink-0"
        >
          <UsersIcon />
          회원 관리
          {pendingCount > 0 && (
            <span className="bg-red-700 text-white text-[10px] font-bold px-1.5 py-px rounded-lg">
              {pendingCount}
            </span>
          )}
        </button>
      )}

      <div className="flex items-center gap-2 bg-hub-bg rounded-full py-1.5 pl-3.5 pr-2 shrink-0">
        <span className="text-[13px] font-medium text-hub-text">{currentUserName}</span>
        <button
          onClick={onLogout}
          className="text-[11px] text-hub-muted bg-white rounded-xl px-2.5 py-0.5 font-medium"
        >
          로그아웃
        </button>
      </div>

      <button
        onClick={onAddProject}
        className="bg-hub-primary text-hub-primary-foreground rounded-[10px] px-[18px] h-9 text-[13px] font-semibold flex items-center gap-1.5 shrink-0"
      >
        <PlusIcon className="text-hub-primary-foreground" />
        새 프로젝트
      </button>
    </header>
  );
}
