"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { CalculatorInput, Feature } from "@/lib/calculator";
import { DEFAULTS, PROJECT_PRESETS } from "@/lib/constants";
import { generateId } from "@/lib/id";
import type { StoredProject } from "@/types/crm";
import {
  getSavedProjects,
  saveProjectAction,
  deleteProjectAction,
  unlockProjectAction,
  createPublicLinksAction,
} from "@/app/actions";
import type { PublicDocumentMode } from "@/lib/public-link";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "react-hot-toast";

export interface NewProjectInfo {
  name: string;
  firstName: string;
  lastName: string;
  company: string;
}

const emptyNewProjectInfo = (): NewProjectInfo => ({
  name: "",
  firstName: "",
  lastName: "",
  company: "",
});

export function useCalculatorProject() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlProjectId = searchParams.get("project");

  const [config, setConfig] = useState<CalculatorInput>(DEFAULTS);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectInfo, setNewProjectInfo] = useState<NewProjectInfo>(emptyNewProjectInfo());

  const sessionId = useMemo(
    () => currentProjectId || generateId(),
    [currentProjectId]
  );

  const isLocked = useMemo(() => {
    if (!currentProjectId) return false;
    const p = projects.find((proj) => proj.id === currentProjectId);
    return !!p?.isApproved;
  }, [projects, currentProjectId]);

  const fetchProjects = useCallback(async () => {
    const data = await getSavedProjects();
    setProjects(data as StoredProject[]);
    return data as StoredProject[];
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedProjects = await fetchProjects();
      if (urlProjectId) {
        setCurrentProjectId(urlProjectId);
        const project = storedProjects.find((p) => p.id === urlProjectId);
        if (project) setConfig(project.config);
      }
    };
    init();
  }, [urlProjectId, fetchProjects]);

  useEffect(() => {
    if (currentProjectId && currentProjectId !== urlProjectId) {
      router.replace(`?project=${currentProjectId}`);
    } else if (!currentProjectId && urlProjectId) {
      router.replace(`?`);
    }
  }, [currentProjectId, urlProjectId, router]);

  useEffect(() => {
    localStorage.setItem("nw_pricer_draft", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const draft = localStorage.getItem("nw_pricer_draft");
    if (draft && !currentProjectId) {
      try {
        setConfig(JSON.parse(draft));
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  const updateConfig = useCallback((updates: Partial<CalculatorInput>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };

      if (updates.projectType && updates.projectType !== prev.projectType) {
        const presets = PROJECT_PRESETS[updates.projectType];
        const oldPresets = PROJECT_PRESETS[prev.projectType];
        const proposalUpdates: Partial<CalculatorInput["proposal"]> = {};

        if (
          prev.proposal.projectOverview === oldPresets.projectOverview ||
          prev.proposal.projectOverview === DEFAULTS.proposal.projectOverview
        ) {
          proposalUpdates.projectOverview = presets.projectOverview;
        }
        if (
          prev.proposal.businessGoals === oldPresets.businessGoals ||
          prev.proposal.businessGoals === DEFAULTS.proposal.businessGoals
        ) {
          proposalUpdates.businessGoals = presets.businessGoals;
        }

        newConfig.proposal = { ...newConfig.proposal, ...proposalUpdates };
      }

      return newConfig;
    });
  }, []);

  const updateProposal = useCallback((updates: Partial<CalculatorInput["proposal"]>) => {
    setConfig((prev) => ({
      ...prev,
      proposal: { ...prev.proposal, ...updates },
    }));
  }, []);

  const toggleFeature = useCallback(
    (f: Feature) => {
      updateConfig({
        features: config.features.includes(f)
          ? config.features.filter((x) => x !== f)
          : [...config.features, f],
      });
    },
    [config.features, updateConfig]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const id = sessionId;
    const name = config.proposal.projectName || "Untitled Project";
    const client = config.proposal.clientName || "Untitled Client";

    const res = await saveProjectAction({ id, name, client, config });
    setIsSaving(false);

    if (res.success) {
      setCurrentProjectId(id);
      fetchProjects();
      toast.success(`Project "${name}" saved to database.`);
    } else {
      toast.error("Failed to save project. " + res.error);
    }
  }, [sessionId, config, fetchProjects]);

  const handleCopyMagicLink = useCallback(
    async (activeTab: string) => {
      if (!currentProjectId) return;
      const mode: PublicDocumentMode =
        activeTab === "calculator"
          ? "quote"
          : activeTab === "proposal"
            ? "proposal"
            : "contract";
      const res = await createPublicLinksAction(currentProjectId, mode);
      if (!res.success) {
        toast.error(res.error || "Failed to create link");
        return;
      }
      const success = await copyToClipboard(res.viewUrl);
      if (success) {
        toast.success(
          mode === "contract" && res.signUrl && res.signUrl !== res.viewUrl
            ? "View link copied (use Sign Link for signing)"
            : "Magic link copied to clipboard"
        );
      } else {
        toast.error("Failed to copy link");
      }
    },
    [currentProjectId]
  );

  const handleCopySignLink = useCallback(async () => {
    if (!currentProjectId) return;
    const res = await createPublicLinksAction(currentProjectId, "contract");
    if (!res.success || !res.signUrl) {
      toast.error(res.error || "Failed to create sign link");
      return;
    }
    const success = await copyToClipboard(res.signUrl);
    if (success) toast.success("Sign link copied to clipboard");
    else toast.error("Failed to copy link");
  }, [currentProjectId]);

  const handleLoad = useCallback((project: StoredProject) => {
    setConfig(project.config);
    setCurrentProjectId(project.id);
    setShowLibrary(false);
  }, []);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string, name: string) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to permanently delete "${name}"?`)) {
        const res = await deleteProjectAction(id);
        if (res.success) {
          if (currentProjectId === id) setCurrentProjectId(null);
          fetchProjects();
          toast.success("Project deleted");
        } else {
          toast.error("Failed to delete. " + res.error);
        }
      }
    },
    [currentProjectId, fetchProjects]
  );

  const handleNew = useCallback(() => setShowNewModal(true), []);

  const confirmNewProject = useCallback(() => {
    setConfig({
      ...DEFAULTS,
      proposal: {
        ...DEFAULTS.proposal,
        projectName: newProjectInfo.name,
        clientName: `${newProjectInfo.firstName} ${newProjectInfo.lastName}`.trim(),
        clientFirstName: newProjectInfo.firstName,
        clientLastName: newProjectInfo.lastName,
        clientCompany: newProjectInfo.company,
      },
    });
    setCurrentProjectId(null);
    setShowNewModal(false);
    setNewProjectInfo(emptyNewProjectInfo());
    localStorage.removeItem("nw_pricer_draft");
  }, [newProjectInfo]);

  const handlePromoteToContract = useCallback(() => {
    const presets = PROJECT_PRESETS[config.projectType];
    const updates: Partial<CalculatorInput["proposal"]> = {};

    if (!config.proposal.exclusions || config.proposal.exclusions === DEFAULTS.proposal.exclusions) {
      updates.exclusions = presets.exclusions;
    }
    if (!config.proposal.assumptions || config.proposal.assumptions === DEFAULTS.proposal.assumptions) {
      updates.assumptions = presets.assumptions;
    }
    if (
      !config.proposal.projectOverview ||
      config.proposal.projectOverview === DEFAULTS.proposal.projectOverview
    ) {
      updates.projectOverview = presets.projectOverview;
    }
    if (
      !config.proposal.businessGoals ||
      config.proposal.businessGoals === DEFAULTS.proposal.businessGoals
    ) {
      updates.businessGoals = presets.businessGoals;
    }

    updateProposal(updates);
    toast.success(`Promoted to Contract: Loaded ${config.projectType.replace("_", " ")} presets.`);
    return true;
  }, [config, updateProposal]);

  const handleUnlock = useCallback(async () => {
    if (!currentProjectId) return;
    if (
      confirm(
        "Are you sure you want to unlock this document? This will clear the existing signatures and mark the document as a draft again."
      )
    ) {
      const res = await unlockProjectAction(currentProjectId);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === currentProjectId
              ? { ...p, isApproved: false, signedBy: null, approvedAt: null }
              : p
          )
        );
        toast.success("Document unlocked for editing");
      } else {
        toast.error("Failed to unlock: " + res.error);
      }
    }
  }, [currentProjectId]);

  const applyTemplate = useCallback((templateConfig: Partial<CalculatorInput>) => {
    setConfig((prev) => ({ ...prev, ...templateConfig }));
  }, []);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId),
    [projects, currentProjectId]
  );

  return {
    config,
    currentProjectId,
    sessionId,
    projects,
    isSaving,
    isLocked,
    showLibrary,
    setShowLibrary,
    showNewModal,
    setShowNewModal,
    newProjectInfo,
    setNewProjectInfo,
    currentProject,
    updateConfig,
    updateProposal,
    toggleFeature,
    handleSave,
    handleCopyMagicLink,
    handleCopySignLink,
    handleLoad,
    handleDelete,
    handleNew,
    confirmNewProject,
    handlePromoteToContract,
    handleUnlock,
    applyTemplate,
  };
}
