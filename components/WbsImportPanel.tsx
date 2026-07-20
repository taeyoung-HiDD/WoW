"use client";

import type { WbsImportResult } from "@/lib/wbs/types";

export type WbsImportMode = "replace" | "append";

interface WbsImportPanelProps {
  result: WbsImportResult;
  unmatchedNames?: string[];
  /** When set, shows replace/append controls (existing project). */
  mode?: WbsImportMode;
  onModeChange?: (mode: WbsImportMode) => void;
  existingMilestoneCount?: number;
  onClear?: () => void;
}

export function WbsImportPanel({
  result,
  unmatchedNames = [],
  mode,
  onModeChange,
  existingMilestoneCount = 0,
  onClear,
}: WbsImportPanelProps) {
  return (
    <div className="rounded-[10px] border border-hub-border bg-hub-bg p-3.5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-hub-secondary uppercase tracking-wider">
            WBS 미리보기
          </div>
          <div className="text-[13px] text-hub-text mt-1">
            마일스톤 <strong className="font-semibold">{result.milestones.length}</strong>개
            {result.skippedRows > 0 && (
              <span className="text-hub-muted">
                {" "}
                · 스킵 {result.skippedRows}행
              </span>
            )}
          </div>
          {(result.projectStart || result.projectEnd) && (
            <div className="text-[11px] text-hub-muted mt-0.5">
              기간 {result.projectStart ?? "?"} ~ {result.projectEnd ?? "?"}
            </div>
          )}
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] text-hub-muted shrink-0 px-2 py-1"
          >
            제거
          </button>
        )}
      </div>

      {mode != null && onModeChange && existingMilestoneCount > 0 && (
        <div className="flex gap-1.5">
          {(
            [
              { value: "replace" as const, label: "기존 교체" },
              { value: "append" as const, label: "뒤에 추가" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onModeChange(opt.value)}
              className={`flex-1 text-[12px] px-2.5 py-1.5 rounded-lg transition-all ${
                mode === opt.value
                  ? "font-semibold bg-hub-primary text-hub-primary-foreground"
                  : "font-medium bg-white text-hub-secondary border border-hub-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {mode === "replace" && existingMilestoneCount > 0 && (
        <div className="text-[11px] text-amber-800 bg-amber-50 rounded-lg px-2.5 py-2">
          기존 마일스톤 {existingMilestoneCount}개가 모두 교체됩니다.
        </div>
      )}

      <div className="max-h-[160px] overflow-y-auto scrollbar-hub flex flex-col gap-1">
        {result.milestones.slice(0, 40).map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 text-[12px] bg-white rounded-md px-2 py-1.5 border border-[#F0F5EE]"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                m.done ? "bg-hub-success" : "bg-hub-border"
              }`}
            />
            <span className="flex-1 min-w-0 truncate text-hub-text">{m.name}</span>
            <span className="text-[10px] text-hub-muted shrink-0 whitespace-nowrap">
              {m.start.slice(5)}~{m.end.slice(5)}
            </span>
          </div>
        ))}
        {result.milestones.length > 40 && (
          <div className="text-[11px] text-hub-muted text-center py-1">
            외 {result.milestones.length - 40}개…
          </div>
        )}
      </div>

      {(result.warnings.length > 0 || unmatchedNames.length > 0) && (
        <div className="text-[11px] text-hub-secondary space-y-1">
          {result.warnings.slice(0, 5).map((w, i) => (
            <div key={`w-${i}`}>⚠ {w}</div>
          ))}
          {unmatchedNames.length > 0 && (
            <div>
              매칭되지 않은 담당자: {unmatchedNames.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface WbsFilePickerProps {
  onParsed: (result: WbsImportResult) => void;
  onError: (message: string) => void;
  label?: string;
  disabled?: boolean;
}

export function WbsFilePicker({
  onParsed,
  onError,
  label = "WBS 엑셀 업로드",
  disabled,
}: WbsFilePickerProps) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!/\.xlsx?$/i.test(file.name)) {
      onError("xlsx 엑셀 파일만 업로드할 수 있습니다.");
      return;
    }

    try {
      const { parseWbsFile } = await import("@/lib/wbs/parseWbsWorkbook");
      const result = await parseWbsFile(file);
      onParsed(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : "엑셀 파싱에 실패했습니다.");
    }
  };

  return (
    <label
      className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3.5 h-9 text-[13px] font-semibold cursor-pointer border border-[#E8D9A8] bg-hub-surface text-hub-primary ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M7 2.5v6M4.5 5.5L7 2.5l2.5 3M2.5 10.5h9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
      <input
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
    </label>
  );
}
