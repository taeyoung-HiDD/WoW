"use client";

import dynamic from "next/dynamic";

const ProjectHubApp = dynamic(() => import("@/components/ProjectHubApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-hub-bg flex items-center justify-center">
      <div className="text-hub-muted text-sm">로딩 중...</div>
    </div>
  ),
});

export default function ClientAppLoader() {
  return <ProjectHubApp />;
}
