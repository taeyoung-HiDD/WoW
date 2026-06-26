import type { AuthUser, Project, ProjectFile } from "@/lib/types";
import { normalizeProjectMilestones } from "@/lib/utils";
import type { Database } from "./database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const dateFmt: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export function profileToAuthUser(row: ProfileRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at).toLocaleDateString("ko-KR", dateFmt),
  };
}

export function projectRowToProject(row: ProjectRow): Project {
  return normalizeProjectMilestones({
    id: row.id,
    name: row.name,
    desc: row.description,
    start: row.start_date,
    end: row.end_date,
    status: row.status as Project["status"],
    color: row.color,
    notes: row.notes,
    files: (row.files as unknown as ProjectFile[]) ?? [],
    archived: row.archived,
    members: row.members ?? [],
    milestones: (row.milestones as unknown as Project["milestones"]) ?? [],
  });
}

export function projectToRow(project: Project): Database["public"]["Tables"]["projects"]["Insert"] {
  const normalized = normalizeProjectMilestones(project);
  return {
    id: normalized.id,
    name: normalized.name,
    description: normalized.desc,
    start_date: normalized.start,
    end_date: normalized.end,
    status: normalized.status,
    color: normalized.color,
    notes: normalized.notes,
    archived: normalized.archived,
    members: normalized.members,
    milestones: normalized.milestones as unknown as Database["public"]["Tables"]["projects"]["Insert"]["milestones"],
    files: normalized.files as unknown as Database["public"]["Tables"]["projects"]["Insert"]["files"],
    updated_at: new Date().toISOString(),
  };
}
