import { TEAM } from "./constants";
import type { Project, Milestone } from "./types";

export function fmt(
  d: string,
  opts?: Intl.DateTimeFormatOptions
): string {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("ko-KR", opts ?? {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function todayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getWeekRange(today: Date) {
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const wStart = new Date(today);
  wStart.setDate(today.getDate() - dow);
  const wEnd = new Date(wStart);
  wEnd.setDate(wStart.getDate() + 6);
  return { wStart, wEnd };
}

export function milestoneRangeFmt(
  project: Project,
  milestone: Milestone,
  index: number
): string {
  const prevMs = index > 0 ? project.milestones[index - 1] : null;
  const msStart = prevMs ? prevMs.due : project.start;
  return `${fmt(msStart, { month: "short", day: "numeric" })} ~ ${fmt(milestone.due, { month: "short", day: "numeric" })}`;
}

export function calcProgress(milestones: Milestone[]) {
  const total = milestones.length;
  const done = milestones.filter((m) => m.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, progress };
}

export function getMemberNames(memberIds: string[]): string {
  return (
    memberIds
      .map((id) => TEAM.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(" · ") || "미지정"
  );
}
