"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COLORS } from "@/lib/constants";
import { INITIAL_PROJECTS } from "@/lib/data";
import {
  fetchAllProfiles,
  fetchApprovedMembers,
  fetchProfile,
  fetchProjects,
  insertProjects,
  deleteProjectFromDb,
  signIn,
  signOut,
  signUp,
  updateProfileStatus,
  upsertProject,
} from "@/lib/supabase/api";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import type {
  AppView,
  AuthUser,
  AuthView,
  KanbanItem,
  Project,
  ProjectStatus,
  ProjectView,
} from "@/lib/types";
import {
  calcProgress,
  getWeekRange,
  getNextWeekRange,
  milestoneRangeFmt,
  todayAtMidnight,
} from "@/lib/utils";

export function useProjectHub() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<AppView>("dashboard");
  const [selId, setSelId] = useState<string | null>(null);
  const [calDate, setCalDate] = useState(new Date());
  const [projectView, setProjectView] = useState<ProjectView>("list");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showMsForm, setShowMsForm] = useState(false);
  const [showFileForm, setShowFileForm] = useState(false);
  const [ganttExpanded, setGanttExpanded] = useState<Record<string, boolean>>({});
  const [addForm, setAddForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    desc: "",
    color: COLORS[0],
  });
  const [newMsName, setNewMsName] = useState("");
  const [newMsDue, setNewMsDue] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [approvedMembers, setApprovedMembers] = useState<AuthUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    error: "",
  });
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [configError] = useState(() => !isSupabaseConfigured());

  const loadProjectsForUser = useCallback(async (user: AuthUser) => {
    if (user.status !== "approved") return;

    let loaded = await fetchProjects();
    if (loaded.length === 0) {
      await insertProjects(INITIAL_PROJECTS);
      loaded = INITIAL_PROJECTS;
    }
    setProjects(loaded);
  }, []);

  const loadAdminUsers = useCallback(async (user: AuthUser) => {
    if (user.role === "admin" && user.status === "approved") {
      const users = await fetchAllProfiles();
      setAuthUsers(users);
    }
  }, []);

  const loadApprovedMembers = useCallback(async (user: AuthUser) => {
    if (user.status !== "approved") {
      setApprovedMembers([]);
      return;
    }
    const members = await fetchApprovedMembers();
    setApprovedMembers(members);
  }, []);

  const refreshCurrentUser = useCallback(
    async (userId: string) => {
      const profile = await fetchProfile(userId);
      if (!profile) return;
      setCurrentUser(profile);
      await loadProjectsForUser(profile);
      await loadAdminUsers(profile);
      await loadApprovedMembers(profile);
    },
    [loadAdminUsers, loadApprovedMembers, loadProjectsForUser]
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setHydrated(true);
      return;
    }

    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setProjects([]);
          setAuthUsers([]);
          setApprovedMembers([]);
          return;
        }

        if (
          session?.user &&
          (event === "SIGNED_IN" ||
            event === "TOKEN_REFRESHED" ||
            event === "INITIAL_SESSION")
        ) {
          await refreshCurrentUser(session.user.id);
        }
      }
    );

    const hydrationTimeout = setTimeout(() => {
      if (mounted) setHydrated(true);
    }, 3000);

    void supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user && mounted) {
          await refreshCurrentUser(session.user.id);
        }
      })
      .catch(() => {
        /* ignore auth init errors */
      })
      .finally(() => {
        clearTimeout(hydrationTimeout);
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
      clearTimeout(hydrationTimeout);
      subscription.unsubscribe();
    };
  }, [refreshCurrentUser]);

  const syncProject = useCallback((project: Project) => {
    void upsertProject(project);
  }, []);

  const updateProjects = useCallback(
    (fn: (p: Project) => Project) => {
      setProjects((prev) => {
        const next = prev.map(fn);
        for (let i = 0; i < next.length; i++) {
          if (JSON.stringify(next[i]) !== JSON.stringify(prev[i])) {
            syncProject(next[i]);
          }
        }
        return next;
      });
    },
    [syncProject]
  );

  const today = useMemo(() => todayAtMidnight(), []);
  const { wStart, wEnd } = useMemo(() => getWeekRange(today), [today]);
  const { nwStart, nwEnd } = useMemo(() => getNextWeekRange(today), [today]);

  const active = useMemo(
    () => projects.filter((p) => !p.archived),
    [projects]
  );
  const archived = useMemo(
    () => projects.filter((p) => p.archived),
    [projects]
  );

  const kanbanData = useMemo(() => {
    const all: KanbanItem[] = [];
    active.forEach((proj) => {
      proj.milestones.forEach((m, idx) => {
        const d = new Date(m.due + "T00:00:00");
        const isThisWeek = d >= wStart && d <= wEnd;
        const isOverdue = d < wStart && !m.done;
        if (isThisWeek || isOverdue) {
          all.push({
            ...m,
            projectId: proj.id,
            projectName: proj.name,
            projectColor: proj.color,
            rangeFmt: milestoneRangeFmt(proj, m, idx),
          });
        }
      });
    });
    all.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
    const kanbanToday = all.filter(
      (ms) => new Date(ms.due + "T00:00:00") <= today
    );
    const kanbanUpcoming = all.filter((ms) => {
      const d = new Date(ms.due + "T00:00:00");
      return d > today && d <= wEnd;
    });

    const kanbanNextWeek: KanbanItem[] = [];
    active.forEach((proj) => {
      proj.milestones.forEach((m, idx) => {
        const d = new Date(m.due + "T00:00:00");
        if (d >= nwStart && d <= nwEnd) {
          kanbanNextWeek.push({
            ...m,
            projectId: proj.id,
            projectName: proj.name,
            projectColor: proj.color,
            rangeFmt: milestoneRangeFmt(proj, m, idx),
          });
        }
      });
    });
    kanbanNextWeek.sort(
      (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()
    );

    return {
      kanbanToday,
      kanbanUpcoming,
      kanbanNextWeek,
      taskCount: kanbanToday.length + kanbanUpcoming.length + kanbanNextWeek.length,
    };
  }, [active, today, wStart, wEnd, nwStart, nwEnd]);

  const signup = async () => {
    if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password.trim()) {
      setAuthForm((f) => ({ ...f, error: "모든 항목을 입력해주세요" }));
      return;
    }
    if (authForm.password.length < 6) {
      setAuthForm((f) => ({ ...f, error: "비밀번호는 6자 이상이어야 합니다" }));
      return;
    }

    setAuthLoading(true);
    const result = await signUp(
      authForm.name,
      authForm.email,
      authForm.password
    );
    setAuthLoading(false);

    if (result.error) {
      setAuthForm((f) => ({ ...f, error: result.error! }));
      return;
    }

    if (result.needsEmailConfirm) {
      setAuthForm((f) => ({
        ...f,
        error: "",
        password: "",
        name: "",
        email: "",
      }));
      setAuthView("login");
      setAuthForm((f) => ({
        ...f,
        error: "가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.",
      }));
      return;
    }

    if (result.user) {
      setCurrentUser(result.user);
      await loadProjectsForUser(result.user);
      await loadAdminUsers(result.user);
      await loadApprovedMembers(result.user);
    }
    setAuthForm({ name: "", email: "", password: "", error: "" });
  };

  const login = async () => {
    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthForm((f) => ({ ...f, error: "이메일과 비밀번호를 입력해주세요" }));
      return;
    }

    setAuthLoading(true);
    const result = await signIn(authForm.email, authForm.password);
    setAuthLoading(false);

    if (result.error) {
      setAuthForm((f) => ({ ...f, error: result.error! }));
      return;
    }

    if (result.user) {
      setCurrentUser(result.user);
      await loadProjectsForUser(result.user);
      await loadAdminUsers(result.user);
      await loadApprovedMembers(result.user);
    }
    setAuthForm({ name: "", email: "", password: "", error: "" });
  };

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
    setProjects([]);
    setAuthUsers([]);
    setApprovedMembers([]);
    setAuthView("login");
  };

  const approveUser = async (uid: string) => {
    const ok = await updateProfileStatus(uid, "approved");
    if (!ok) return;
    const users = await fetchAllProfiles();
    setAuthUsers(users);
    if (currentUser?.status === "approved") {
      const members = await fetchApprovedMembers();
      setApprovedMembers(members);
    }
  };

  const rejectUser = async (uid: string) => {
    const ok = await updateProfileStatus(uid, "rejected");
    if (!ok) return;
    const users = await fetchAllProfiles();
    setAuthUsers(users);
  };

  const toggleMs = (pid: string, mid: string) => {
    updateProjects((p) =>
      p.id !== pid
        ? p
        : {
            ...p,
            milestones: p.milestones.map((m) =>
              m.id !== mid ? m : { ...m, done: !m.done }
            ),
          }
    );
  };

  const addMember = (pid: string, uid: string) => {
    updateProjects((p) => {
      if (p.id !== pid) return p;
      const members = p.members || [];
      if (members.includes(uid)) return p;
      return { ...p, members: [...members, uid] };
    });
  };

  const removeMember = (pid: string, uid: string) => {
    updateProjects((p) => {
      if (p.id !== pid) return p;
      return {
        ...p,
        members: (p.members || []).filter((m) => m !== uid),
      };
    });
  };

  const archiveProject = (pid: string) => {
    updateProjects((p) => (p.id !== pid ? p : { ...p, archived: true }));
    setSelId(null);
  };

  const restoreProject = (pid: string) => {
    updateProjects((p) => (p.id !== pid ? p : { ...p, archived: false }));
  };

  const deleteProject = (pid: string) => {
    if (
      !window.confirm(
        "프로젝트를 영구 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다."
      )
    ) {
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== pid));
    void deleteProjectFromDb(pid);
    if (selId === pid) setSelId(null);
  };

  const setNotes = (pid: string, notes: string) => {
    updateProjects((p) => (p.id !== pid ? p : { ...p, notes }));
  };

  const setStatus = (pid: string, status: ProjectStatus) => {
    updateProjects((p) => (p.id !== pid ? p : { ...p, status }));
  };

  const addMs = () => {
    if (!selId || !newMsName.trim() || !newMsDue) return;
    const ms = {
      id: "ms_" + Date.now(),
      name: newMsName.trim(),
      due: newMsDue,
      done: false,
    };
    updateProjects((p) =>
      p.id !== selId ? p : { ...p, milestones: [...p.milestones, ms] }
    );
    setNewMsName("");
    setNewMsDue("");
    setShowMsForm(false);
  };

  const addFile = () => {
    if (!selId || !newFileName.trim() || !newFileUrl.trim()) return;
    const f = {
      id: "f_" + Date.now(),
      name: newFileName.trim(),
      url: newFileUrl.trim(),
    };
    updateProjects((p) =>
      p.id !== selId ? p : { ...p, files: [...(p.files || []), f] }
    );
    setNewFileName("");
    setNewFileUrl("");
    setShowFileForm(false);
  };

  const addProject = () => {
    if (!addForm.name.trim() || !addForm.startDate || !addForm.endDate) return;
    const np: Project = {
      id: "p_" + Date.now(),
      name: addForm.name.trim(),
      desc: addForm.desc || "",
      start: addForm.startDate,
      end: addForm.endDate,
      status: "not_started",
      color: addForm.color || COLORS[projects.length % COLORS.length],
      milestones: [],
      notes: "",
      files: [],
      archived: false,
      members: [],
    };
    setProjects((prev) => [...prev, np]);
    void upsertProject(np);
    setShowAddProject(false);
    setAddForm({
      name: "",
      startDate: "",
      endDate: "",
      desc: "",
      color: COLORS[0],
    });
  };

  const toggleGanttExpand = (pid: string) => {
    setGanttExpanded((prev) => ({ ...prev, [pid]: !prev[pid] }));
  };

  const openProject = (id: string) => {
    setSelId(id);
    setShowMsForm(false);
    setShowFileForm(false);
  };

  const selProj = selId ? projects.find((p) => p.id === selId) ?? null : null;
  const selProgress = selProj ? calcProgress(selProj.milestones) : null;

  const pendingCount = authUsers.filter((u) => u.status === "pending").length;
  const isLoggedIn = !!currentUser;
  const isApproved = isLoggedIn && currentUser.status === "approved";
  const isPending = isLoggedIn && currentUser.status === "pending";
  const isAdmin = isLoggedIn && currentUser.role === "admin";

  return {
    hydrated,
    configError,
    authLoading,
    projects,
    active,
    archived,
    view,
    setView,
    selId,
    setSelId,
    selProj,
    selProgress,
    calDate,
    setCalDate,
    projectView,
    setProjectView,
    showAddProject,
    setShowAddProject,
    showMsForm,
    setShowMsForm,
    showFileForm,
    setShowFileForm,
    ganttExpanded,
    toggleGanttExpand,
    addForm,
    setAddForm,
    newMsName,
    setNewMsName,
    newMsDue,
    setNewMsDue,
    newFileName,
    setNewFileName,
    newFileUrl,
    setNewFileUrl,
    authUsers,
    approvedMembers,
    currentUser,
    authView,
    setAuthView,
    authForm,
    setAuthForm,
    showUserPanel,
    setShowUserPanel,
    today,
    wStart,
    wEnd,
    kanbanData,
    isLoggedIn,
    isApproved,
    isPending,
    isAdmin,
    pendingCount,
    signup,
    login,
    logout,
    approveUser,
    rejectUser,
    toggleMs,
    addMember,
    removeMember,
    archiveProject,
    restoreProject,
    deleteProject,
    setNotes,
    setStatus,
    addMs,
    addFile,
    addProject,
    openProject,
  };
}
