import type { Milestone } from "@/lib/types";

export type WbsImportResult = {
  projectName?: string;
  projectStart?: string;
  projectEnd?: string;
  milestones: Milestone[];
  ownerNames: string[];
  skippedRows: number;
  warnings: string[];
};
