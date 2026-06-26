import type { AuthUser, Project } from "@/lib/types";
import { getSupabase } from "./client";
import { profileToAuthUser, projectRowToProject, projectToRow } from "./mappers";

export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다";
  }
  if (lower.includes("user already registered")) {
    return "이미 가입된 이메일입니다";
  }
  if (lower.includes("password should be at least")) {
    return "비밀번호는 6자 이상이어야 합니다";
  }
  if (lower.includes("unable to validate email")) {
    return "올바른 이메일 주소를 입력해주세요";
  }
  if (lower.includes("email not confirmed")) {
    return "이메일 인증이 필요합니다. 메일함을 확인해주세요";
  }
  return message;
}

export async function fetchProfile(userId: string, retries = 0): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if ((error || !data) && retries < 5) {
    await new Promise((r) => setTimeout(r, 400));
    return fetchProfile(userId, retries + 1);
  }

  if (error || !data) return null;
  return profileToAuthUser(data);
}

export async function fetchAllProfiles(): Promise<AuthUser[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(profileToAuthUser);
}

export async function fetchApprovedMembers(): Promise<AuthUser[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data.map(profileToAuthUser);
}

export async function updateProfileStatus(
  userId: string,
  status: "approved" | "rejected"
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  return !error;
}

export async function fetchProjects(): Promise<Project[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(projectRowToProject);
}

export async function upsertProject(project: Project): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("projects")
    .upsert(projectToRow(project), { onConflict: "id" });

  return !error;
}

export async function deleteProjectFromDb(projectId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  return !error;
}

export async function insertProjects(projects: Project[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || projects.length === 0) return false;

  const { error } = await supabase
    .from("projects")
    .insert(projects.map(projectToRow));

  return !error;
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ user: AuthUser | null; needsEmailConfirm: boolean; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, needsEmailConfirm: false, error: "Supabase가 설정되지 않았습니다" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { name: name.trim() } },
  });

  if (error) {
    return { user: null, needsEmailConfirm: false, error: mapAuthError(error.message) };
  }

  if (!data.user) {
    return { user: null, needsEmailConfirm: false, error: "가입에 실패했습니다" };
  }

  if (!data.session) {
    return { user: null, needsEmailConfirm: true, error: null };
  }

  const profile = await fetchProfile(data.user.id);
  return { user: profile, needsEmailConfirm: false, error: null };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, error: "Supabase가 설정되지 않았습니다" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { user: null, error: mapAuthError(error.message) };
  }

  if (!data.user) {
    return { user: null, error: "로그인에 실패했습니다" };
  }

  const profile = await fetchProfile(data.user.id);
  if (!profile) {
    return { user: null, error: "프로필을 불러올 수 없습니다" };
  }

  return { user: profile, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}
