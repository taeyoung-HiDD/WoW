"use client";

import { DAY_HEADERS } from "@/lib/constants";
import type { Project } from "@/lib/types";

interface CalendarViewProps {
  projects: Project[];
  calDate: Date;
  onCalDateChange: (d: Date) => void;
  onOpenProject: (id: string) => void;
  today: Date;
}

export function CalendarView({
  projects,
  calDate,
  onCalDateChange,
  onOpenProject,
  today,
}: CalendarViewProps) {
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay = new Date(calYear, calMonth + 1, 0);
  const pad = (firstDay.getDay() + 6) % 7;

  const days: {
    date?: number;
    dateStr?: string;
    hasDate: boolean;
    milestones: {
      id: string;
      name: string;
      done: boolean;
      projectId: string;
      color: string;
    }[];
    isToday: boolean;
    isSat: boolean;
    isSun: boolean;
  }[] = [];

  for (let i = 0; i < pad; i++) {
    days.push({ hasDate: false, milestones: [], isToday: false, isSat: false, isSun: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dt = new Date(calYear, calMonth, d);
    const isToday = dt.toDateString() === today.toDateString();
    const isSat = dt.getDay() === 6;
    const isSun = dt.getDay() === 0;
    const dayMs: (typeof days)[number]["milestones"] = [];

    projects.forEach((proj) => {
      proj.milestones.forEach((m) => {
        if (m.due === ds) {
          dayMs.push({
            id: m.id,
            name: m.name,
            done: m.done,
            projectId: proj.id,
            color: proj.color,
          });
        }
      });
    });

    days.push({ date: d, dateStr: ds, hasDate: true, milestones: dayMs, isToday, isSat, isSun });
  }

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

      <div className="grid grid-cols-7 gap-[3px]">
        {days.map((day, i) => (
          <div
            key={i}
            className="min-h-[88px] rounded-lg p-1.5 overflow-hidden"
            style={{
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
              <>
                <div
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center mb-0.5 text-xs shrink-0"
                  style={{
                    fontWeight: day.isToday ? 700 : 400,
                    color: day.isToday ? "#1A2E1E" : day.isSat
                        ? "#4A90D9"
                        : day.isSun
                          ? "#D4685A"
                          : "#1A2E1E",
                    background: day.isToday ? "#EDC651" : "transparent",
                  }}
                >
                  {day.date}
                </div>
                {day.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    onClick={() => onOpenProject(ms.projectId)}
                    className="flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer mt-0.5"
                    style={{
                      background: ms.done ? "#F0FDF4" : ms.color + "1A",
                    }}
                  >
                    <div
                      className="w-[5px] h-[5px] rounded-full shrink-0"
                      style={{ background: ms.color }}
                    />
                    <span className="text-[10px] overflow-hidden whitespace-nowrap text-ellipsis flex-1 min-w-0 leading-snug">
                      {ms.name}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
