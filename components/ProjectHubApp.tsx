"use client";

import { ArchiveView } from "@/components/ArchiveView";
import { AuthScreen, PendingScreen } from "@/components/AuthScreen";
import { Header } from "@/components/Header";
import { KanbanBoard } from "@/components/KanbanBoard";
import {
  AddProjectModal,
  ProjectModal,
  UserPanel,
} from "@/components/Modals";
import { ProjectSection } from "@/components/ProjectSection";
import { useProjectHub } from "@/hooks/useProjectHub";

export default function ProjectHubApp() {
  const hub = useProjectHub();

  if (!hub.hydrated) {
    return (
      <div className="min-h-screen bg-hub-bg flex items-center justify-center">
        <div className="text-hub-muted text-sm">로딩 중...</div>
      </div>
    );
  }

  if (hub.configError) {
    return (
      <div className="min-h-screen bg-hub-bg flex items-center justify-center p-6">
        <div className="bg-white rounded-[20px] p-10 w-full max-w-[440px] shadow-[0_8px_40px_rgba(26,46,30,0.12)] text-center">
          <div className="text-[17px] font-bold text-hub-text mb-3">Supabase 설정 필요</div>
          <p className="text-sm text-hub-secondary leading-relaxed">
            <code className="text-xs bg-hub-bg px-1.5 py-0.5 rounded">.env.local</code> 파일에
            Supabase URL과 anon key를 입력한 뒤 개발 서버를 재시작해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!hub.isLoggedIn) {
    return (
      <AuthScreen
        authView={hub.authView}
        authForm={hub.authForm}
        onNameChange={(v) =>
          hub.setAuthForm((f) => ({ ...f, name: v, error: "" }))
        }
        onEmailChange={(v) =>
          hub.setAuthForm((f) => ({ ...f, email: v, error: "" }))
        }
        onPasswordChange={(v) =>
          hub.setAuthForm((f) => ({ ...f, password: v, error: "" }))
        }
        onLogin={hub.login}
        onSignup={hub.signup}
        authLoading={hub.authLoading}
        onGoLogin={() => {
          hub.setAuthView("login");
          hub.setAuthForm({ name: "", email: "", password: "", error: "" });
        }}
        onGoSignup={() => {
          hub.setAuthView("signup");
          hub.setAuthForm({ name: "", email: "", password: "", error: "" });
        }}
      />
    );
  }

  if (hub.isPending) {
    return (
      <PendingScreen
        userName={hub.currentUser?.name ?? ""}
        onLogout={hub.logout}
      />
    );
  }

  const todayStr = hub.today.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const todayShortStr = hub.today.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
  const weekStr = `${hub.wStart.getMonth() + 1}/${hub.wStart.getDate()} ~ ${hub.wEnd.getMonth() + 1}/${hub.wEnd.getDate()}`;

  const getProjectMembers = (projectId: string) =>
    hub.projects.find((p) => p.id === projectId)?.members ?? [];

  return (
    <div className="min-h-screen bg-hub-bg text-hub-text">
      <Header
        view={hub.view}
        todayStr={todayStr}
        currentUserName={hub.currentUser?.name ?? ""}
        isAdmin={hub.isAdmin}
        pendingCount={hub.pendingCount}
        onViewChange={hub.setView}
        onOpenUserPanel={() => hub.setShowUserPanel(true)}
        onLogout={hub.logout}
        onAddProject={() => hub.setShowAddProject(true)}
      />

      <main className="px-7 pb-16 max-w-[1440px] mx-auto">
        {hub.view === "dashboard" && (
          <>
            <KanbanBoard
              kanbanToday={hub.kanbanData.kanbanToday}
              kanbanUpcoming={hub.kanbanData.kanbanUpcoming}
              weekStr={weekStr}
              todayShortStr={todayShortStr}
              thisWeekCount={hub.kanbanData.thisWeekCount}
              onOpenProject={hub.openProject}
              onToggleMs={hub.toggleMs}
              getProjectMembers={getProjectMembers}
            />
            <ProjectSection
              projects={hub.active}
              projectView={hub.projectView}
              onViewChange={hub.setProjectView}
              onOpenProject={hub.openProject}
              calDate={hub.calDate}
              onCalDateChange={hub.setCalDate}
              ganttExpanded={hub.ganttExpanded}
              onToggleGanttExpand={hub.toggleGanttExpand}
              today={hub.today}
            />
          </>
        )}

        {hub.view === "archive" && (
          <ArchiveView projects={hub.archived} onRestore={hub.restoreProject} />
        )}
      </main>

      <ProjectModal
        project={hub.selProj}
        today={hub.today}
        showMsForm={hub.showMsForm}
        showFileForm={hub.showFileForm}
        newMsName={hub.newMsName}
        newMsDue={hub.newMsDue}
        newFileName={hub.newFileName}
        newFileUrl={hub.newFileUrl}
        onClose={() => hub.setSelId(null)}
        onArchive={() => hub.selId && hub.archiveProject(hub.selId)}
        onStatusChange={(status) => hub.selId && hub.setStatus(hub.selId, status)}
        onToggleMember={(tid) => hub.selId && hub.toggleMember(hub.selId, tid)}
        onToggleMs={(mid) => hub.selId && hub.toggleMs(hub.selId, mid)}
        onNotesChange={(notes) => hub.selId && hub.setNotes(hub.selId, notes)}
        onOpenMsForm={() => hub.setShowMsForm(true)}
        onCancelMsForm={() => {
          hub.setShowMsForm(false);
          hub.setNewMsName("");
          hub.setNewMsDue("");
        }}
        onSubmitMs={hub.addMs}
        onMsNameChange={hub.setNewMsName}
        onMsDueChange={hub.setNewMsDue}
        onOpenFileForm={() => hub.setShowFileForm(true)}
        onCancelFileForm={() => {
          hub.setShowFileForm(false);
          hub.setNewFileName("");
          hub.setNewFileUrl("");
        }}
        onSubmitFile={hub.addFile}
        onFileNameChange={hub.setNewFileName}
        onFileUrlChange={hub.setNewFileUrl}
      />

      <AddProjectModal
        open={hub.showAddProject}
        form={hub.addForm}
        onClose={() => {
          hub.setShowAddProject(false);
          hub.setAddForm({
            name: "",
            startDate: "",
            endDate: "",
            desc: "",
            color: hub.addForm.color,
          });
        }}
        onChange={(field, value) =>
          hub.setAddForm((f) => ({ ...f, [field]: value }))
        }
        onSubmit={hub.addProject}
      />

      <UserPanel
        open={hub.showUserPanel}
        users={hub.authUsers}
        onClose={() => hub.setShowUserPanel(false)}
        onApprove={hub.approveUser}
        onReject={hub.rejectUser}
      />
    </div>
  );
}
