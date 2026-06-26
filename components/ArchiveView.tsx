"use client";

import { MemberAvatars } from "./Avatar";
import type { Project, ProjectMember } from "@/lib/types";
import { calcProgress, fmt } from "@/lib/utils";

interface ArchiveViewProps {
  projects: Project[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  membersLookup: ProjectMember[];
}

export function ArchiveView({ projects, onRestore, onDelete, membersLookup }: ArchiveViewProps) {
  return (
    <div className="pt-[26px]">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-[11px] font-bold text-hub-secondary uppercase tracking-widest">
          아카이브
        </span>
        <span className="text-xs text-hub-muted">{projects.length}개</span>
        <div className="flex-1 h-px bg-hub-border" />
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-hub-muted text-sm">
          아카이브된 프로젝트가 없습니다
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((p) => {
            const { done, total, progress } = calcProgress(p.milestones);
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-hub-border px-[18px] py-3.5 flex items-center gap-3.5"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-hub-text">{p.name}</div>
                  <div className="text-xs text-hub-muted mt-0.5">
                    {fmt(p.start)} ~ {fmt(p.end)} · {done}/{total} 완료
                  </div>
                </div>
                <MemberAvatars memberIds={p.members} membersLookup={membersLookup} />
                <div className="text-sm font-bold text-hub-secondary">{progress}%</div>
                <button
                  onClick={() => onRestore(p.id)}
                  className="bg-hub-surface text-hub-primary rounded-lg px-4 py-1.5 text-[13px] font-semibold"
                >
                  복원
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="bg-red-50 text-red-700 rounded-lg px-4 py-1.5 text-[13px] font-semibold"
                >
                  삭제
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
