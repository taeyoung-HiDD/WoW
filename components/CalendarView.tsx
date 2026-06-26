"use client";

import { useMemo } from "react";
import { DAY_HEADERS } from "@/lib/constants";
import type { Project } from "@/lib/types";
import {
  milestoneEnd,
  milestoneStart,
} from "@/lib/utils";

interface CalendarViewProps {
  projects: Project[];
  calDate: Date;
  onCalDateChange: (d: Date) => void;
  onOpenProject: (id: string) => void;
  today: Date;
}

interface DayCell {
  date?: number;
  dateStr?: string;
  hasDate: boolean;
  isToday: boolean;
  isSat: boolean;
  isSun: boolean;
}

interface MilestoneSegment {
  key: string;
  milestoneId: string;
  projectId: string;
  name: string;
  done: boolean;
  color: string;
  weekIndex: number;
  startCol: number;
  endCol: number;
  lane: number;
  roundLeft: boolean;
  roundRight: boolean;
  showLabel: boolean;
}

function dateInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

function buildWeeks(calYear: number, calMonth: number, today: Date): DayCell[][] {
  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay = new Date(calYear, calMonth + 1, 0);
  const pad = (firstDay.getDay() + 6) % 7;
  const days: DayCell[] = [];

  for (let i = 0; i < pad; i++) {
    days.push({ hasDate: false, isToday: false, isSat: false, isSun: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dt = new Date(calYear, calMonth, d);
    const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      date: d,
      dateStr: ds,
      hasDate: true,
      isToday: dt.toDateString() === today.toDateString(),
      isSat: dt.getDay() === 6,
      isSun: dt.getDay() === 0,
    });
  }

  while (days.length % 7 !== 0) {
    days.push({ hasDate: false, isToday: false, isSat: false, isSun: false });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function assignLanes(
  segments: Omit<MilestoneSegment, "lane">[]
): MilestoneSegment[] {
  const byWeek = new Map<number, Omit<MilestoneSegment, "lane">[]>();
  segments.forEach((seg) => {
    const list = byWeek.get(seg.weekIndex) ?? [];
    list.push(seg);
    byWeek.set(seg.weekIndex, list);
  });

  const result: MilestoneSegment[] = [];
  byWeek.forEach((weekSegs) => {
    const sorted = [...weekSegs].sort(
      (a, b) =>
        a.startCol - b.startCol ||
        b.endCol - a.endCol - (a.endCol - a.startCol)
    );
    const laneEnds: number[] = [];

    sorted.forEach((seg) => {
      let lane = laneEnds.findIndex((endCol) => endCol < seg.startCol);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(seg.endCol);
      } else {
        laneEnds[lane] = seg.endCol;
      }
      result.push({ ...seg, lane });
    });
  });

  return result;
}

function buildMilestoneSegments(
  projects: Project[],
  weeks: DayCell[][],
  monthStart: string,
  monthEnd: string
): MilestoneSegment[] {
  const raw: Omit<MilestoneSegment, "lane">[] = [];
  const labelShown = new Set<string>();

  projects.forEach((proj) => {
    proj.milestones.forEach((m, idx) => {
      const msStart = milestoneStart(m, proj, idx);
      const msEnd = milestoneEnd(m);
      if (!msStart || !msEnd) return;
      if (msEnd < monthStart || msStart > monthEnd) return;

      weeks.forEach((week, weekIndex) => {
        let startCol = -1;
        let endCol = -1;
        let segStartDate = "";
        let segEndDate = "";

        week.forEach((day, col) => {
          if (!day.hasDate || !day.dateStr) return;
          if (!dateInRange(day.dateStr, msStart, msEnd)) return;
          if (startCol === -1) {
            startCol = col;
            segStartDate = day.dateStr;
          }
          endCol = col;
          segEndDate = day.dateStr;
        });

        if (startCol === -1 || endCol === -1) return;

        const showLabel = !labelShown.has(m.id);
        if (showLabel) labelShown.add(m.id);

        raw.push({
          key: `${m.id}-w${weekIndex}`,
          milestoneId: m.id,
          projectId: proj.id,
          name: m.name,
          done: m.done,
          color: proj.color,
          weekIndex,
          startCol,
          endCol,
          roundLeft: msStart === segStartDate || segStartDate === monthStart,
          roundRight: msEnd === segEndDate || segEndDate === monthEnd,
          showLabel,
        });
      });
    });
  });

  return assignLanes(raw);
}

const BAR_H = 16;
const BAR_GAP = 3;
const DATE_H = 28;

export function CalendarView({
  projects,
  calDate,
  onCalDateChange,
  onOpenProject,
  today,
}: CalendarViewProps) {
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const monthStart = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
  const monthEnd = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(
    new Date(calYear, calMonth + 1, 0).getDate()
  ).padStart(2, "0")}`;

  const weeks = useMemo(
    () => buildWeeks(calYear, calMonth, today),
    [calYear, calMonth, today]
  );

  const segments = useMemo(
    () => buildMilestoneSegments(projects, weeks, monthStart, monthEnd),
    [projects, weeks, monthStart, monthEnd]
  );

  const lanesPerWeek = useMemo(() => {
    const map = new Map<number, number>();
    segments.forEach((seg) => {
      map.set(seg.weekIndex, Math.max(map.get(seg.weekIndex) ?? 0, seg.lane + 1));
    });
    return map;
  }, [segments]);

  const prevMonth = () => {
    const d = new Date(calDate);
    d.setMonth(d.getMonth() - 1);
    onCalDateChange(d);
  };

  const nextMonth = () => {
    const d = new Date(calDate);
    d.setMonth(d.getMonth() + 1);
    onCalDateChange(d);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mt-3.5 mb-5">
        <button
          onClick={prevMonth}
          className="w-[34px] h-[34px] rounded-lg bg-white border border-hub-border text-hub-secondary text-[17px] flex items-center justify-center"
        >
          ‹
        </button>
        <div className="text-lg font-bold text-hub-text min-w-[140px] text-center">
          {calDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
        </div>
        <button
          onClick={nextMonth}
          className="w-[34px] h-[34px] rounded-lg bg-white border border-hub-border text-hub-secondary text-[17px] flex items-center justify-center"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-[3px] mb-[3px]">
        {DAY_HEADERS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-semibold text-hub-muted py-1.5 tracking-wide"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[3px]">
        {weeks.map((week, weekIndex) => {
          const laneCount = lanesPerWeek.get(weekIndex) ?? 0;
          const barAreaH = laneCount > 0 ? laneCount * (BAR_H + BAR_GAP) + 4 : 0;
          const weekSegments = segments.filter((s) => s.weekIndex === weekIndex);

          return (
            <div key={weekIndex} className="relative">
              <div className="grid grid-cols-7 gap-[3px]">
                {week.map((day, col) => (
                  <div
                    key={col}
                    className="rounded-lg p-1.5 overflow-hidden"
                    style={{
                      minHeight: DATE_H + barAreaH + 8,
                      background: day.hasDate
                        ? day.isToday
                          ? "#FFFBF2"
                          : "white"
                        : "transparent",
                      border: day.hasDate
                        ? `1px solid ${day.isToday ? "#EDC651" : "#E8DFC0"}`
                        : "none",
                    }}
                  >
                    {day.hasDate && (
                      <div
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{
                          fontWeight: day.isToday ? 700 : 400,
                          color: day.isToday
                            ? "#1A2E1E"
                            : day.isSat
                              ? "#4A90D9"
                              : day.isSun
                                ? "#D4685A"
                                : "#1A2E1E",
                          background: day.isToday ? "#EDC651" : "transparent",
                        }}
                      >
                        {day.date}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {weekSegments.length > 0 && (
                <div
                  className="absolute left-0 right-0 grid grid-cols-7 gap-[3px] pointer-events-none px-0"
                  style={{ top: DATE_H, height: barAreaH }}
                >
                  {weekSegments.map((seg) => {
                    const borderRadius = seg.roundLeft
                      ? seg.roundRight
                        ? "5px"
                        : "5px 0 0 5px"
                      : seg.roundRight
                        ? "0 5px 5px 0"
                        : "0";

                    return (
                      <div
                        key={seg.key}
                        className="pointer-events-auto cursor-pointer flex items-center overflow-hidden px-1"
                        style={{
                          gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                          marginTop: seg.lane * (BAR_H + BAR_GAP),
                          height: BAR_H,
                          background: seg.done ? "#DCFCE7" : seg.color + "33",
                          borderLeft: `3px solid ${seg.done ? "#40916C" : seg.color}`,
                          borderRadius,
                          opacity: seg.done ? 0.75 : 1,
                        }}
                        title={seg.name}
                        onClick={() => onOpenProject(seg.projectId)}
                      >
                        {seg.showLabel && (
                          <span
                            className="text-[9px] font-semibold truncate leading-none"
                            style={{ color: seg.done ? "#166534" : "#1A2E1E" }}
                          >
                            {seg.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
