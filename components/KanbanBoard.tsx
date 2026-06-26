"use client";

import type { KanbanItem } from "@/lib/types";
import { MemberAvatars } from "./Avatar";
import { CheckIcon } from "./icons";

interface KanbanBoardProps {
  kanbanToday: KanbanItem[];
  kanbanUpcoming: KanbanItem[];
  weekStr: string;
  todayShortStr: string;
  thisWeekCount: number;
  onOpenProject: (id: string) => void;
  onToggleMs: (projectId: string, msId: string) => void;
  getProjectMembers: (projectId: string) => string[];
}

function KanbanCard({
  item,
  variant,
  memberIds,
  onOpen,
  onToggle,
}: {
  item: KanbanItem;
  variant: "today" | "upcoming";
  memberIds: string[];
  onOpen: () => void;
  onToggle: () => void;
}) {
  const borderColor =
    variant === "today" ? "border-hub-today-border" : "border-hub-upcoming-border";
  const dateColor = variant === "today" ? "text-[#B8953A]" : "text-[#7A9AD8]";

  return (
    <div
      className={`bg-white rounded-lg border ${borderColor} px-2.5 py-2 flex items-center gap-2`}
    >
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: item.projectColor }}
          />
          <span className="text-xs text-hub-muted truncate">{item.projectName}</span>
        </div>
        <div
          className={`text-sm leading-snug ${
            item.done
              ? "font-normal text-hub-muted line-through"
              : "font-semibold text-hub-text"
          }`}
        >
          {item.name}
        </div>
        <div className={`text-[10px] mt-0.5 ${dateColor}`}>{item.rangeFmt}</div>
      </div>
      {memberIds.length > 0 && <MemberAvatars memberIds={memberIds} size="sm" />}
      <button
        onClick={onToggle}
        className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center transition-all mt-px"
        style={{
          border: `1.5px solid ${item.done ? "#40916C" : "#C8DCC0"}`,
          background: item.done ? "#40916C" : "transparent",
        }}
      >
        {item.done && <CheckIcon />}
      </button>
    </div>
  );
}

export function KanbanBoard({
  kanbanToday,
  kanbanUpcoming,
  weekStr,
  todayShortStr,
  thisWeekCount,
  onOpenProject,
  onToggleMs,
  getProjectMembers,
}: KanbanBoardProps) {
  return (
    <div className="pt-[26px]">
      <div className="flex items-center gap-2.5 mb-3.5">
        <span className="text-[11px] font-bold text-hub-secondary uppercase tracking-widest">
          이번 주 할 일
        </span>
        <span className="text-xs text-hub-muted">{weekStr}</span>
        <div className="flex-1 h-px bg-hub-border" />
        <span className="text-xs text-hub-muted">{thisWeekCount}개 마일스톤</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="bg-hub-today-bg rounded-xl p-3 border border-hub-today-border">
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-[7px] h-[7px] rounded-full bg-hub-today-accent shrink-0" />
            <span className="text-xs font-bold text-hub-today-text">오늘 진행 중</span>
            <span className="text-[11px] text-[#B8953A]">{todayShortStr}</span>
            <div className="flex-1" />
            <span className="text-[11px] font-semibold text-hub-today-text bg-amber-100 px-1.5 py-px rounded-[10px]">
              {kanbanToday.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 min-h-[120px]">
            {kanbanToday.length === 0 ? (
              <div className="text-center py-7 text-xs text-[#C8AC78]">
                진행 중인 Task 없음
              </div>
            ) : (
              kanbanToday.map((item) => (
                <KanbanCard
                  key={`${item.projectId}-${item.id}`}
                  item={item}
                  variant="today"
                  memberIds={getProjectMembers(item.projectId)}
                  onOpen={() => onOpenProject(item.projectId)}
                  onToggle={() => onToggleMs(item.projectId, item.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-hub-upcoming-bg rounded-xl p-3 border border-hub-upcoming-border">
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-[7px] h-[7px] rounded-full bg-hub-upcoming-accent shrink-0" />
            <span className="text-xs font-bold text-hub-upcoming-text">이번 주 예정</span>
            <div className="flex-1" />
            <span className="text-[11px] font-semibold text-hub-upcoming-text bg-blue-100 px-1.5 py-px rounded-[10px]">
              {kanbanUpcoming.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 min-h-[120px]">
            {kanbanUpcoming.length === 0 ? (
              <div className="text-center py-7 text-xs text-[#93A8D8]">
                예정된 Task 없음
              </div>
            ) : (
              kanbanUpcoming.map((item) => (
                <KanbanCard
                  key={`${item.projectId}-${item.id}`}
                  item={item}
                  variant="upcoming"
                  memberIds={getProjectMembers(item.projectId)}
                  onOpen={() => onOpenProject(item.projectId)}
                  onToggle={() => onToggleMs(item.projectId, item.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
