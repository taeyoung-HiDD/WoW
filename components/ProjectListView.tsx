"use client";

import { STATUS } from "@/lib/constants";
import type { Project } from "@/lib/types";
import { fmt, getMemberNames } from "@/lib/utils";

interface ProjectListViewProps {
  projects: Project[];
  onOpenProject: (id: string) => void;
}

export function ProjectListView({ projects, onOpenProject }: ProjectListViewProps) {
  const sorted = [...projects].sort(
    (a, b) => new Date(a.end).getTime() - new Date(b.end).getTime()
  );

  return (
    <>
      <div className="hidden md:grid grid-cols-[2fr_110px_1.5fr_1.5fr_120px] gap-3 px-4 py-2.5 bg-hub-surface rounded-t-[10px] border border-hub-border border-b-0">
        {["프로젝트", "기간", "진행 중인 Task", "다음 Task", "담당자"].map((h) => (
          <span
            key={h}
            className="text-[11px] font-bold text-hub-secondary tracking-wide"
          >
            {h}
          </span>
        ))}
      </div>
      <div className="bg-white rounded-b-[10px] md:rounded-t-none rounded-[10px] border border-hub-border overflow-hidden">
        {sorted.map((p) => {
          const sc = STATUS[p.status];
          const notDone = p.milestones
            .filter((m) => !m.done)
            .sort((a, b) => a.due.localeCompare(b.due));
          const cur = notDone[0];
          const nxt = notDone[1];

          return (
            <div
              key={p.id}
              onClick={() => onOpenProject(p.id)}
              className="grid grid-cols-1 md:grid-cols-[2fr_110px_1.5fr_1.5fr_120px] gap-3 px-4 py-[11px] border-b border-[#F0F5EE] cursor-pointer transition-colors hover:bg-[#F7FAF5] items-center"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-[13px] text-hub-text truncate">
                    {p.name}
                  </div>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[10px] inline-flex mt-0.5"
                    style={{ color: sc.color, background: sc.bg }}
                  >
                    {sc.label}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-hub-muted leading-snug">
                <div>{fmt(p.start)}</div>
                <div>~ {fmt(p.end)}</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-hub-text truncate">
                  {cur?.name ?? "—"}
                </div>
                <div className="text-[10px] text-hub-muted mt-px">
                  {cur ? fmt(cur.due) : ""}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-hub-secondary truncate">
                  {nxt?.name ?? "—"}
                </div>
                <div className="text-[10px] text-hub-muted mt-px">
                  {nxt ? fmt(nxt.due) : ""}
                </div>
              </div>
              <div className="text-xs text-hub-secondary truncate">
                {getMemberNames(p.members)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
