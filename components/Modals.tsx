"use client";

import { useEffect, useState } from "react";
import { COLORS, STATUS } from "@/lib/constants";
import type { Project, ProjectMember, ProjectStatus } from "@/lib/types";
import { resolveProjectMembers } from "@/lib/utils";
import { fmt } from "@/lib/utils";
import { FileIcon } from "./icons";

function InlineEditableName({
  value,
  onChange,
  className = "",
  placeholder = "이름 입력",
}: {
  value: string;
  onChange: (name: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setDraft(value);
    }
  };

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(value);
          e.currentTarget.blur();
        }
      }}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none border border-transparent rounded-md px-1 -mx-1 focus:border-hub-border focus:bg-white ${className}`}
    />
  );
}

interface AddProjectModalProps {
  open: boolean;
  form: {
    name: string;
    startDate: string;
    endDate: string;
    desc: string;
    color: string;
  };
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export function AddProjectModal({
  open,
  form,
  onClose,
  onChange,
  onSubmit,
}: AddProjectModalProps) {
  if (!open) return null;

  const inputClass =
    "w-full border border-hub-border rounded-[10px] px-3.5 py-2.5 text-sm outline-none bg-white";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ background: "var(--color-hub-overlay)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[460px] p-7 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[17px] font-bold text-hub-text mb-5">새 프로젝트 추가</h2>
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold text-hub-secondary block mb-1.5">
              프로젝트 이름 *
            </label>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="프로젝트 이름 입력"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-hub-secondary block mb-1.5">
                시작일 *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
                className="w-full border border-hub-border rounded-[10px] px-3 py-2.5 text-[13px] outline-none bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-hub-secondary block mb-1.5">
                종료일 *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => onChange("endDate", e.target.value)}
                className="w-full border border-hub-border rounded-[10px] px-3 py-2.5 text-[13px] outline-none bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-hub-secondary block mb-1.5">
              설명 (선택)
            </label>
            <textarea
              value={form.desc}
              onChange={(e) => onChange("desc", e.target.value)}
              placeholder="프로젝트 간단 설명..."
              rows={2}
              className="w-full border border-hub-border rounded-[10px] px-3.5 py-2.5 text-[13px] resize-none outline-none bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-hub-secondary block mb-2.5">
              프로젝트 색상
            </label>
            <div className="flex gap-2.5 flex-wrap items-center px-0.5 py-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange("color", c)}
                  className="w-7 h-7 rounded-full shrink-0 transition-all"
                  style={{
                    background: c,
                    boxShadow:
                      form.color === c
                        ? `0 0 0 2.5px white, 0 0 0 4.5px ${c}`
                        : "none",
                    transform: form.color === c ? "scale(1.18)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 mt-5 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[10px] text-sm text-hub-secondary bg-hub-surface"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="px-5 py-2 rounded-[10px] text-sm font-semibold bg-hub-primary text-hub-primary-foreground"
          >
            프로젝트 생성
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProjectModalProps {
  project: Project | null;
  today: Date;
  showMsForm: boolean;
  showFileForm: boolean;
  newMsName: string;
  newMsDue: string;
  newFileName: string;
  newFileUrl: string;
  onClose: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  approvedMembers: ProjectMember[];
  onStatusChange: (status: ProjectStatus) => void;
  onProjectNameChange: (name: string) => void;
  onMilestoneNameChange: (mid: string, name: string) => void;
  onToggleMs: (mid: string) => void;
  onNotesChange: (notes: string) => void;
  onOpenMsForm: () => void;
  onCancelMsForm: () => void;
  onSubmitMs: () => void;
  onMsNameChange: (v: string) => void;
  onMsDueChange: (v: string) => void;
  onOpenFileForm: () => void;
  onCancelFileForm: () => void;
  onSubmitFile: () => void;
  onFileNameChange: (v: string) => void;
  onFileUrlChange: (v: string) => void;
}

export function ProjectModal({
  project,
  today,
  showMsForm,
  showFileForm,
  newMsName,
  newMsDue,
  newFileName,
  newFileUrl,
  onClose,
  onArchive,
  onDelete,
  onAddMember,
  onRemoveMember,
  approvedMembers,
  onStatusChange,
  onProjectNameChange,
  onMilestoneNameChange,
  onToggleMs,
  onNotesChange,
  onOpenMsForm,
  onCancelMsForm,
  onSubmitMs,
  onMsNameChange,
  onMsDueChange,
  onOpenFileForm,
  onCancelFileForm,
  onSubmitFile,
  onFileNameChange,
  onFileUrlChange,
}: ProjectModalProps) {
  if (!project) return null;

  const done = project.milestones.filter((m) => m.done).length;
  const total = project.milestones.length;
  const assigned = resolveProjectMembers(project.members || [], approvedMembers);
  const available = approvedMembers.filter(
    (m) => !(project.members || []).includes(m.id)
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center py-10 px-5 overflow-y-auto"
      style={{ background: "var(--color-hub-overlay)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[590px] flex flex-col max-h-[calc(100vh-80px)] animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: project.color }}
              />
              <h2 className="text-[19px] font-bold text-hub-text leading-snug flex-1 min-w-0">
                <InlineEditableName
                  value={project.name}
                  onChange={onProjectNameChange}
                  className="text-[19px] font-bold text-hub-text leading-snug"
                  placeholder="프로젝트 이름"
                />
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onArchive}
                className="text-xs text-hub-muted px-3 py-1 rounded-[7px] bg-hub-bg font-medium"
              >
                아카이브
              </button>
              <button
                onClick={onDelete}
                className="text-xs text-red-700 px-3 py-1 rounded-[7px] bg-red-50 font-medium"
              >
                삭제
              </button>
              <button
                onClick={onClose}
                className="w-[30px] h-[30px] rounded-lg bg-hub-bg text-hub-secondary text-xl flex items-center justify-center leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-3.5">
            {(Object.entries(STATUS) as [ProjectStatus, (typeof STATUS)[ProjectStatus]][]).map(
              ([key, sc]) => {
                const isActive = project.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => onStatusChange(key)}
                    className="text-xs rounded-full px-3 py-1 transition-all"
                    style={{
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? sc.color : "#8FAE94",
                      background: isActive ? sc.bg : "#F2F5EF",
                      border: `1px solid ${isActive ? sc.color + "50" : "transparent"}`,
                    }}
                  >
                    {sc.label}
                  </button>
                );
              }
            )}
          </div>

          <div className="bg-hub-bg rounded-xl px-4 py-3 flex flex-col gap-1">
            <div className="text-[11px] font-bold text-hub-secondary uppercase tracking-wider">
              프로젝트 설명
            </div>
            <div className="text-[13px] text-hub-text leading-relaxed">
              {project.desc || "설명 없음"}
            </div>
            <div className="text-[11px] text-hub-muted mt-0.5">
              {fmt(project.start)} ~ {fmt(project.end)} · {done}/{total} 마일스톤 완료
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-7 pt-4 flex flex-col gap-5">
          <div>
            <div className="text-[11px] font-bold text-hub-secondary uppercase tracking-widest mb-2.5">
              담당자
            </div>

            {assigned.length > 0 ? (
              <div className="flex flex-col gap-1.5 mb-3">
                {assigned.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-hub-bg"
                  >
                    <div
                      className="w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                      style={{ background: m.color }}
                    >
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-hub-text">{m.name}</div>
                      <div className="text-[11px] text-hub-muted truncate">{m.email}</div>
                    </div>
                    <button
                      onClick={() => onRemoveMember(m.id)}
                      className="w-6 h-6 rounded-md bg-red-50 text-red-700 text-sm flex items-center justify-center shrink-0"
                      title="담당자 제거"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-hub-muted mb-3">담당자 없음</div>
            )}

            {available.length > 0 ? (
              <>
                <div className="text-[11px] font-bold text-hub-secondary uppercase tracking-widest mb-2">
                  담당자 추가
                </div>
                <div className="flex gap-2 flex-wrap">
                  {available.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onAddMember(m.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hub-surface border border-hub-border transition-all hover:border-hub-primary"
                    >
                      <div
                        className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                        style={{ background: m.color }}
                      >
                        {m.name[0]}
                      </div>
                      <span className="text-[13px] text-hub-text">{m.name}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-hub-muted">
                {approvedMembers.length === 0
                  ? "가입·승인된 사용자가 없습니다"
                  : "추가할 수 있는 사용자가 없습니다"}
              </div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-bold text-hub-secondary uppercase tracking-widest mb-2.5">
              마일스톤
            </div>
            <div className="flex flex-col gap-1">
              {project.milestones.map((m, idx, arr) => {
                const prevMs = idx > 0 ? arr[idx - 1] : null;
                const msStart = new Date(
                  (prevMs ? prevMs.due : project.start) + "T00:00:00"
                );
                const msDue = new Date(m.due + "T00:00:00");
                const isInProgress = !m.done && today >= msStart && today <= msDue;
                const isOverdue = !m.done && msDue < today;

                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                    style={{
                      background: m.done
                        ? "#F0FDF4"
                        : isInProgress
                          ? "#FFFBF0"
                          : "#F7FAF5",
                      border: isInProgress ? "1px solid #F5E6C0" : "1px solid transparent",
                    }}
                  >
                    <button
                      onClick={() => onToggleMs(m.id)}
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all"
                      style={{
                        border: `2px solid ${m.done ? "#40916C" : isInProgress ? "#E8A838" : "#D3E8CA"}`,
                        background: m.done ? "#40916C" : "transparent",
                      }}
                    >
                      {m.done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M1.5 5l2.5 2.5 4.5-4.5"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <InlineEditableName
                        value={m.name}
                        onChange={(name) => onMilestoneNameChange(m.id, name)}
                        className={`text-sm ${
                          m.done
                            ? "font-normal text-hub-muted line-through"
                            : "font-medium text-hub-text"
                        }`}
                        placeholder="마일스톤 이름"
                      />
                      {isInProgress && (
                        <span className="text-[10px] font-bold text-hub-today-text bg-amber-100 px-2 py-0.5 rounded-[10px] shrink-0 whitespace-nowrap">
                          진행 중
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: m.done ? "#8FAE94" : isOverdue ? "#B91C1C" : "#8FAE94" }}
                    >
                      {fmt(m.due)}
                    </span>
                  </div>
                );
              })}
            </div>

            {showMsForm ? (
              <div className="mt-2.5 flex gap-2 items-center flex-wrap">
                <input
                  value={newMsName}
                  onChange={(e) => onMsNameChange(e.target.value)}
                  placeholder="마일스톤 이름"
                  className="flex-1 min-w-[130px] border border-hub-border rounded-lg px-3 py-2 text-[13px] outline-none bg-white"
                />
                <input
                  type="date"
                  value={newMsDue}
                  onChange={(e) => onMsDueChange(e.target.value)}
                  className="border border-hub-border rounded-lg px-2.5 py-2 text-[13px] outline-none bg-white"
                />
                <button
                  onClick={onSubmitMs}
                  className="bg-hub-primary text-hub-primary-foreground rounded-lg px-3.5 py-2 text-[13px] font-semibold"
                >
                  추가
                </button>
                <button onClick={onCancelMsForm} className="text-hub-muted text-[13px] px-0.5 py-2">
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenMsForm}
                className="mt-2.5 text-[13px] text-hub-accent font-semibold flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1.5v9M1.5 6h9"
                    stroke="#EDC651"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                마일스톤 추가
              </button>
            )}
          </div>

          <div>
            <div className="text-[11px] font-bold text-hub-secondary uppercase tracking-widest mb-2.5">
              메모
            </div>
            <textarea
              value={project.notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="프로젝트 메모나 코멘트를 입력하세요..."
              className="w-full min-h-[90px] border border-hub-border rounded-[10px] p-3 text-[13px] text-hub-text bg-hub-bg resize-y outline-none leading-relaxed"
            />
          </div>

          <div>
            <div className="text-[11px] font-bold text-hub-secondary uppercase tracking-widest mb-2.5">
              파일 링크
            </div>
            {(project.files || []).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 py-1.5 border-b border-hub-surface"
              >
                <FileIcon />
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-hub-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {f.name}
                </a>
              </div>
            ))}

            {showFileForm ? (
              <div className="mt-2 flex gap-2 flex-wrap">
                <input
                  value={newFileName}
                  onChange={(e) => onFileNameChange(e.target.value)}
                  placeholder="파일 이름"
                  className="flex-1 min-w-[100px] border border-hub-border rounded-lg px-3 py-2 text-[13px] outline-none"
                />
                <input
                  value={newFileUrl}
                  onChange={(e) => onFileUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="flex-[2] min-w-[140px] border border-hub-border rounded-lg px-3 py-2 text-[13px] outline-none"
                />
                <button
                  onClick={onSubmitFile}
                  className="bg-hub-primary text-hub-primary-foreground rounded-lg px-3.5 py-2 text-[13px] font-semibold"
                >
                  추가
                </button>
                <button
                  onClick={onCancelFileForm}
                  className="text-hub-muted text-[13px] px-0.5 py-2"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenFileForm}
                className="mt-2 text-[13px] text-hub-accent font-semibold flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1.5v9M1.5 6h9"
                    stroke="#EDC651"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                파일 링크 추가
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserPanelProps {
  open: boolean;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function UserPanel({ open, users, onClose, onApprove, onReject }: UserPanelProps) {
  if (!open) return null;

  const statusStyle = (status: string) => {
    if (status === "approved")
      return { label: "승인됨", color: "#166534", bg: "#DCFCE7" };
    if (status === "pending")
      return { label: "대기 중", color: "#92400E", bg: "#FEF3C7" };
    return { label: "거절됨", color: "#B91C1C", bg: "#FEE2E2" };
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center py-10 px-5 overflow-y-auto"
      style={{ background: "var(--color-hub-overlay)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[560px] p-7 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[17px] font-bold text-hub-text">회원 관리</div>
            <div className="text-xs text-hub-muted mt-0.5">총 {users.length}명 등록</div>
          </div>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-lg bg-hub-bg text-hub-secondary text-xl flex items-center justify-center leading-none"
          >
            ×
          </button>
        </div>

        <div>
          {users.map((user) => {
            const sc = statusStyle(user.status);
            return (
              <div
                key={user.id}
                className="flex items-center gap-2.5 py-3 border-b border-[#F0F5EE]"
              >
                <div
                  className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                  style={{
                    background: user.role === "admin" ? "#EDC651" : "#8FAE94",
                    color: user.role === "admin" ? "#1A2E1E" : "white",
                  }}
                >
                  {user.name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-hub-text">{user.name}</span>
                    {user.role === "admin" && (
                      <span className="text-[10px] bg-hub-surface text-hub-primary px-1.5 py-0.5 rounded-md font-semibold">
                        관리자
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-hub-muted mt-px">{user.email}</div>
                </div>
                <div className="text-[11px] text-hub-muted shrink-0">{user.createdAt}</div>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-[10px] shrink-0 whitespace-nowrap"
                  style={{ color: sc.color, background: sc.bg }}
                >
                  {sc.label}
                </span>
                {user.status !== "approved" && (
                  <button
                    onClick={() => onApprove(user.id)}
                    className="bg-green-100 text-green-800 rounded-[7px] px-3 py-1 text-xs font-semibold shrink-0"
                  >
                    승인
                  </button>
                )}
                {user.status !== "rejected" && (
                  <button
                    onClick={() => onReject(user.id)}
                    className="bg-red-100 text-red-700 rounded-[7px] px-3 py-1 text-xs font-semibold shrink-0"
                  >
                    거절
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
