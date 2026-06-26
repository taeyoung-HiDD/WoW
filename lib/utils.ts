import { COLORS } from "./constants";
import type { AuthUser, Milestone, Project, ProjectMember } from "./types";

export function memberColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function toProjectMember(user: AuthUser): ProjectMember {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    color: memberColor(user.id),
  };
}

export function resolveProjectMembers(
  memberIds: string[],
  membersLookup: ProjectMember[]
): ProjectMember[] {
  const map = new Map(membersLookup.map((m) => [m.id, m]));
  return memberIds
    .map((id) => map.get(id))
    .filter((m): m is ProjectMember => !!m);
}

export function fmt(
  d: string,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (!d) return "";
  try {
    const date = new Date(d + "T00:00:00");
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", opts ?? {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function formatProjectRange(start: string, end: string): string {
  if (!end) return `${fmt(start)} ~ 미정`;
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function projectEffectiveEnd(
  project: Project,
  fallback: Date = todayAtMidnight()
): string {
  if (project.end) return project.end;
  const msEnds = project.milestones
    .map((m) => milestoneEnd(m))
    .filter(Boolean)
    .sort();
  if (msEnds.length > 0) return msEnds[msEnds.length - 1];
  return fallback.toISOString().slice(0, 10);
}

export function todayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function parseDateDay(value: string): Date {
  const date = new Date(value + "T00:00:00");
  date.setHours(0, 0, 0, 0);
  return date;
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart.getTime() <= bEnd.getTime() && aEnd.getTime() >= bStart.getTime();
}

export function getWeekRange(today: Date) {
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const wStart = new Date(today);
  wStart.setDate(today.getDate() - dow);
  wStart.setHours(0, 0, 0, 0);
  const wEnd = new Date(wStart);
  wEnd.setDate(wStart.getDate() + 6);
  wEnd.setHours(0, 0, 0, 0);
  return { wStart, wEnd };
}

export function getNextWeekRange(today: Date) {
  const { wEnd } = getWeekRange(today);
  const nwStart = new Date(wEnd);
  nwStart.setDate(wEnd.getDate() + 1);
  nwStart.setHours(0, 0, 0, 0);
  const nwEnd = new Date(nwStart);
  nwEnd.setDate(nwStart.getDate() + 6);
  nwEnd.setHours(0, 0, 0, 0);
  return { nwStart, nwEnd };
}

export function milestoneEnd(milestone: Milestone): string {
  return milestone.end || milestone.due || "";
}

export function milestoneStart(
  milestone: Milestone,
  project: Project,
  index: number
): string {
  if (milestone.start) return milestone.start;
  const prevMs = index > 0 ? project.milestones[index - 1] : null;
  return prevMs ? milestoneEnd(prevMs) : project.start;
}

export function normalizeMilestone(
  milestone: Milestone,
  project: Project,
  index: number
): Milestone {
  const end = milestoneEnd(milestone);
  const start = milestoneStart({ ...milestone, end }, project, index);
  const { due: _due, ...rest } = milestone;
  return { ...rest, start, end };
}

export function normalizeProjectMilestones(project: Project): Project {
  return {
    ...project,
    milestones: project.milestones.map((m, i) =>
      normalizeMilestone(m, project, i)
    ),
  };
}

export function milestoneRangeFmt(
  project: Project,
  milestone: Milestone,
  index: number
): string {
  const msStart = milestoneStart(milestone, project, index);
  const msEnd = milestoneEnd(milestone);
  return `${fmt(msStart, { month: "short", day: "numeric" })} ~ ${fmt(msEnd, { month: "short", day: "numeric" })}`;
}

export function isMilestoneActiveOn(
  milestone: Milestone,
  project: Project,
  index: number,
  day: Date
): boolean {
  if (milestone.done) return false;
  const start = parseDateDay(milestoneStart(milestone, project, index));
  const end = parseDateDay(milestoneEnd(milestone));
  return start.getTime() <= day.getTime() && end.getTime() >= day.getTime();
}

export function isMilestoneOverdue(
  milestone: Milestone,
  project: Project,
  index: number,
  day: Date
): boolean {
  if (milestone.done) return false;
  const end = parseDateDay(milestoneEnd(milestone));
  return end.getTime() < day.getTime();
}

export function milestoneOverlapsRange(
  milestone: Milestone,
  project: Project,
  index: number,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  const start = parseDateDay(milestoneStart(milestone, project, index));
  const end = parseDateDay(milestoneEnd(milestone));
  return rangesOverlap(start, end, rangeStart, rangeEnd);
}

export function calcProgress(milestones: Milestone[]) {
  const total = milestones.length;
  const done = milestones.filter((m) => m.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, progress };
}

export function getMemberNames(
  memberIds: string[],
  membersLookup: ProjectMember[] = []
): string {
  return (
    resolveProjectMembers(memberIds, membersLookup)
      .map((m) => m.name)
      .join(" · ") || "미지정"
  );
}
