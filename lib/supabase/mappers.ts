import type { AuthUser, Milestone, Project, ProjectFile } from "@/lib/types";
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
  return {
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
    milestones: (row.milestones as unknown as Milestone[]) ?? [],
  };
}

export function projectToRow(project: Project): Database["public"]["Tables"]["projects"]["Insert"] {
  return {
    id: project.id,
    name: project.name,
    description: project.desc,
    start_date: project.start,
    end_date: project.end,
    status: project.status,
    color: project.color,
    notes: project.notes,
    archived: project.archived,
    members: project.members,
    milestones: project.milestones as unknown as Database["public"]["Tables"]["projects"]["Insert"]["milestones"],
    files: project.files as unknown as Database["public"]["Tables"]["projects"]["Insert"]["files"],
    updated_at: new Date().toISOString(),
  };
}
