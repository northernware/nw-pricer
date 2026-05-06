"use client";

import { useState, useMemo, useEffect } from "react";
import { calculate } from "@/lib/calculator";
import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode, CalculatorInput, HostingPlan } from "@/lib/calculator";
import { DEFAULTS, TEMPLATES, PROJECT_PRESETS } from "@/lib/constants";
import InputPanel from "./InputPanel";
import OutputPanel from "./OutputPanel";
import LivePreview from "./LivePreview";
import QuoteTemplate from "./QuoteTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Icon } from "@iconify/react";
import { generateId, type StoredProject } from "@/lib/storage";
import { getSavedProjects, saveProjectAction, deleteProjectAction, unlockProjectAction } from "@/app/actions";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function Calculator() {
  const [config, setConfig] = useState<CalculatorInput>(DEFAULTS);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  // Ensure we have a stable ID for the session even if not saved
  const sessionId = useMemo(() => currentProjectId || generateId(), [currentProjectId]);
  const [activeTab, setActiveTab] = useState<'calculator' | 'proposal' | 'contract'>('calculator');
  const [showLibrary, setShowLibrary] = useState(false);
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectInfo, setNewProjectInfo] = useState({ name: "", client: "" });

  const fetchProjects = async () => {
    const data = await getSavedProjects();
    setProjects(data as StoredProject[]);
  };

  const isLocked = useMemo(() => {
    if (!currentProjectId) return false;
    const p = projects.find(proj => proj.id === currentProjectId);
    return !!p?.isApproved;
  }, [projects, currentProjectId]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-save current work to local storage for crash recovery
  useEffect(() => {
    localStorage.setItem("nw_pricer_draft", JSON.stringify(config));
  }, [config]);

  // Load draft on mount if exists
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

  const handleSave = async () => {
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
  };

  const handleCopyMagicLink = async () => {
    if (!currentProjectId) return;
    const url = `${window.location.origin}/p/${currentProjectId}?mode=${activeTab}`;
    const success = await copyToClipboard(url);
    if (success) {
      toast.success("Magic Link copied to clipboard");
    } else {
      toast.error("Failed to copy link");
    }
  };

  const handleLoad = (project: StoredProject) => {
    setConfig(project.config);
    setCurrentProjectId(project.id);
    setShowLibrary(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
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
  };

  const handleNew = () => {
    setShowNewModal(true);
  };

  const confirmNewProject = () => {
    const freshConfig = {
      ...DEFAULTS,
      proposal: {
        ...DEFAULTS.proposal,
        projectName: newProjectInfo.name,
        clientName: newProjectInfo.client
      }
    };
    setConfig(freshConfig);
    setCurrentProjectId(null);
    setShowNewModal(false);
    setNewProjectInfo({ name: "", client: "" });
    // Clear draft
    localStorage.removeItem("nw_pricer_draft");
  };

  const updateConfig = (updates: Partial<CalculatorInput>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateProposal = (updates: Partial<typeof DEFAULTS.proposal>) => {
    setConfig(prev => ({
      ...prev,
      proposal: { ...prev.proposal, ...updates }
    }));
  };

  const handlePromoteToContract = () => {
    const presets = PROJECT_PRESETS[config.projectType];
    const updates: Partial<typeof DEFAULTS.proposal> = {};
    
    // Only update if current fields are empty or generic default
    if (!config.proposal.exclusions || config.proposal.exclusions === DEFAULTS.proposal.exclusions) {
      updates.exclusions = presets.exclusions;
    }
    if (!config.proposal.assumptions || config.proposal.assumptions === DEFAULTS.proposal.assumptions) {
      updates.assumptions = presets.assumptions;
    }
    
    updateProposal(updates);
    setActiveTab('contract');
    toast.success(`Promoted to Contract: Loaded ${config.projectType.replace('_', ' ')} presets.`);
  };

  const handleUnlock = async () => {
    if (!currentProjectId) return;
    if (confirm("Are you sure you want to unlock this document? This will clear the existing signatures and marks the document as a draft again.")) {
      const res = await unlockProjectAction(currentProjectId);
      if (res.success) {
        fetchProjects();
        toast.success("Document unlocked for editing");
      } else {
        toast.error("Failed to unlock: " + res.error);
      }
    }
  };

  const applyTemplate = (templateConfig: Partial<CalculatorInput>) => {
    setConfig(prev => ({ ...prev, ...templateConfig }));
  };

  const exportToPDF = async () => {
    const element = document.getElementById("quote-template");
    if (!element) return;

    // Temporarily bring it into view but hidden from user visually
    element.style.position = "static";
    element.style.top = "0";
    element.style.left = "0";

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 15; // 15mm margin on all sides for a professional look
      const innerHeightMm = pdfHeight - (margin * 2);
      
      // Calculate pixels per mm based on the captured canvas
      const pxPerMm = canvas.width / pdfWidth;
      const innerHeightPx = innerHeightMm * pxPerMm;
      
      let currentY = 0;
      let isFirstPage = true;

      while (currentY < canvas.height) {
        if (!isFirstPage) pdf.addPage();
        
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        const remainingHeight = canvas.height - currentY;
        pageCanvas.height = Math.min(innerHeightPx, remainingHeight);
        
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, currentY, canvas.width, pageCanvas.height, // Source
            0, 0, canvas.width, pageCanvas.height         // Destination
          );
        }
        
        const pageData = pageCanvas.toDataURL("image/png");
        const displayHeight = pageCanvas.height / pxPerMm;
        
        pdf.addImage(pageData, "PNG", 0, margin, pdfWidth, displayHeight);
        
        currentY += innerHeightPx;
        isFirstPage = false;
      }

      const prefix = activeTab === 'calculator' ? 'Quotation' : 
                     activeTab === 'proposal' ? 'Proposal' : 'Contract';
      pdf.save(`NW-${prefix}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast.error("PDF generation failed. Use browser print.");
      window.print();
    } finally {
      // Put it back
      element.style.position = "fixed";
      element.style.top = "-9999px";
      element.style.left = "-9999px";
    }
  };

  const toggleFeature = (f: Feature) => {
    updateConfig({
      features: config.features.includes(f)
        ? config.features.filter((x) => x !== f)
        : [...config.features, f]
    });
  };

  const result = useMemo(
    () => calculate(config),
    [config]
  );

  return (
    <section className="pt-8 pb-[clamp(3rem,6vw,6rem)] relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-40 pointer-events-none"></div>

      <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10">
        {/* Section Header */}


        {/* Reorganized Toolbar */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
          {/* Left: Project Lifecycle Management */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 border transition-all ${
                showLibrary 
                  ? "bg-nw-acid text-white border-nw-acid shadow-lg shadow-nw-acid/20" 
                  : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-black hover:text-nw-black"
              }`}
            >
              <Icon icon="solar:folder-open-linear" />
              Library
            </button>
            
            <button
              onClick={handleNew}
              className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-transparent text-nw-graphite border border-nw-graphite/20 hover:border-nw-black hover:text-nw-black transition-all"
            >
              <Icon icon="solar:document-add-linear" />
              New Project
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 transition-all ${
                isSaving 
                  ? 'bg-nw-graphite/20 text-nw-graphite cursor-not-allowed border border-transparent' 
                  : 'bg-nw-black text-nw-bone border border-nw-black hover:bg-nw-acid hover:border-nw-acid'
              }`}
            >
              <Icon icon={isSaving ? "solar:refresh-linear" : "solar:diskette-linear"} className={isSaving ? "animate-spin" : ""} />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>

          {/* Center: Quick Presets */}
          <div className="flex items-center gap-4 bg-nw-bone/50 px-4 py-2 border border-nw-graphite/5 rounded-sm">
            <div className="font-mono text-[9px] uppercase track-widest text-nw-graphite flex items-center gap-2">
              <Icon icon="solar:magic-stick-linear" />
              Apply Template
            </div>
            <select
              onChange={(e) => applyTemplate(JSON.parse(e.target.value))}
              className="bg-transparent border-b border-nw-graphite/30 hover:border-nw-acid focus:border-nw-acid outline-none font-mono text-[10px] text-nw-black uppercase track-widest cursor-pointer transition-colors py-0.5"
              defaultValue=""
            >
              <option value="" disabled>Select Starting Point...</option>
              {TEMPLATES.map((t) => (
                <option key={t.label} value={JSON.stringify(t.config)} className="bg-nw-bone">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Delivery & Sharing */}
          <div className="flex flex-wrap items-center gap-3">
            {currentProjectId && (
              <button
                onClick={handleCopyMagicLink}
                className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-nw-bone text-nw-acid border border-nw-acid hover:bg-nw-acid hover:text-nw-bone transition-all group"
              >
                <Icon icon="solar:link-linear" className="group-hover:scale-110 transition-transform" />
                Magic Link
              </button>
            )}

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-transparent text-nw-black border border-nw-black hover:bg-nw-black hover:text-nw-bone transition-all"
            >
              <Icon icon="solar:download-minimalistic-linear" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-12 flex border-b border-nw-graphite/20 no-print">
          {(['calculator', 'proposal', 'contract'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-mono text-[10px] uppercase track-widest transition-all border-b-2 ${
                activeTab === tab 
                  ? "border-nw-acid text-nw-black bg-nw-acid/5" 
                  : "border-transparent text-nw-graphite hover:text-nw-black hover:bg-nw-bone"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Project Library Modal */}
        {showLibrary && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 no-print">
            {/* Overlay - Theme-aware (Light in light mode, Dark in dark mode) */}
            <div 
              className="absolute inset-0 bg-nw-bone/80 backdrop-blur-md animate-in fade-in duration-300" 
              onClick={() => setShowLibrary(false)}
            ></div>
            
            {/* Modal Content - Follows theme (Dark in Dark mode, Light in Light mode) */}
            <div className="relative w-full max-w-5xl max-h-[85vh] bg-nw-bone text-nw-black border border-nw-graphite/20 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
              <div className="p-8 border-b border-nw-graphite/10 flex justify-between items-center">
                <div>
                  <div className="font-mono text-xs uppercase track-widest text-nw-acid mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-nw-acid rounded-full animate-pulse"></span>
                    Project Management
                  </div>
                  <h2 className="font-display font-bold text-3xl uppercase tracking-tighter">Saved Projects Library</h2>
                </div>
                <button 
                  onClick={() => setShowLibrary(false)} 
                  className="p-3 text-nw-graphite/50 hover:text-nw-acid hover:rotate-90 transition-all duration-300"
                >
                  <Icon icon="solar:close-circle-linear" className="text-3xl" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.length === 0 ? (
                    <div className="col-span-full py-20 text-center font-mono text-xs text-nw-graphite uppercase track-widest">
                      <Icon icon="solar:folder-open-linear" className="text-4xl mx-auto mb-4 opacity-20" />
                      No saved projects found.
                    </div>
                  ) : (
                    projects.map((p) => (
                      <div 
                        key={p.id} 
                        className="border border-nw-graphite/10 p-6 hover:border-nw-acid hover:bg-nw-acid/5 transition-all cursor-pointer group flex flex-col justify-between"
                        onClick={() => handleLoad(p)}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="font-bold text-xl truncate tracking-tight text-nw-black group-hover:text-nw-acid transition-colors">{p.name}</div>
                            <button 
                              onClick={(e) => handleDelete(e, p.id, p.name)}
                              className="opacity-0 group-hover:opacity-100 text-nw-graphite hover:text-red-500 transition-all p-1"
                              title="Delete Project"
                            >
                              <Icon icon="solar:trash-bin-trash-linear" width="18" />
                            </button>
                          </div>
                          <div className="text-xs text-nw-graphite mb-8 line-clamp-1 font-mono uppercase tracking-wider">{p.client || 'Unknown Client'}</div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-nw-graphite uppercase font-mono track-widest border-t border-nw-graphite/5 pt-5">
                          <span>{new Date(p.lastModified).toLocaleDateString()}</span>
                          <span className="text-nw-acid flex items-center gap-2 font-bold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                            LOAD <Icon icon="solar:arrow-right-linear" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="px-8 py-4 bg-nw-graphite/5 border-t border-nw-graphite/10 flex justify-between items-center font-mono text-[10px] uppercase track-widest text-nw-graphite">
                <span>Northernware Pricing Engine v1.0</span>
                <span>Total Projects: {projects.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* New Project Modal */}
        {showNewModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 no-print">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-nw-bone/80 backdrop-blur-md animate-in fade-in duration-300" 
              onClick={() => setShowNewModal(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-nw-bone text-nw-black border border-nw-graphite/20 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
              <div className="p-8 border-b border-nw-graphite/10 flex justify-between items-center">
                <div>
                  <div className="font-mono text-xs uppercase track-widest text-nw-acid mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-nw-acid rounded-full"></span>
                    Initialize
                  </div>
                  <h2 className="font-display font-bold text-3xl uppercase tracking-tighter">New Project</h2>
                </div>
                <button 
                  onClick={() => setShowNewModal(false)} 
                  className="p-3 text-nw-graphite/50 hover:text-nw-acid hover:rotate-90 transition-all duration-300"
                >
                  <Icon icon="solar:close-circle-linear" className="text-3xl" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <p className="font-body text-sm text-nw-graphite">
                  Starting a new project will clear your current workspace. Unsaved changes will be lost.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Project Name</label>
                    <input 
                      type="text"
                      value={newProjectInfo.name}
                      onChange={(e) => setNewProjectInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Acme Corp Redesign"
                      className="w-full bg-nw-white border border-nw-graphite/20 p-3 font-mono text-xs outline-none focus:border-nw-acid transition-colors"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Client Name</label>
                    <input 
                      type="text"
                      value={newProjectInfo.client}
                      onChange={(e) => setNewProjectInfo(prev => ({ ...prev, client: e.target.value }))}
                      placeholder="e.g. John Doe"
                      className="w-full bg-nw-white border border-nw-graphite/20 p-3 font-mono text-xs outline-none focus:border-nw-acid transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 flex gap-3">
                <button 
                  onClick={confirmNewProject}
                  className="flex-1 bg-nw-black text-nw-bone font-mono text-[10px] uppercase track-widest py-4 hover:bg-nw-acid transition-all shadow-lg hover:shadow-nw-acid/20"
                >
                  Create Project
                </button>
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="px-8 border border-nw-graphite/20 font-mono text-[10px] uppercase track-widest hover:border-nw-black transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Two-column layout */}

        <div id="calculator-content" className="grid grid-cols-12 gap-[clamp(1.5rem,3vw,2.5rem)]">
          {/* Input Column */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-nw-graphite/20 pb-4">
                <div className="font-mono text-xs text-nw-black uppercase track-widest flex items-center gap-2">
                  <Icon icon="solar:settings-linear" />
                  scope.config
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-nw-emerald rounded-full animate-pulse"></div>
                </div>
              </div>

              <InputPanel
                activeTab={activeTab}
                config={config}
                updateConfig={updateConfig}
                updateProposal={updateProposal}
                toggleFeature={toggleFeature}
                totalPrice={result.roundedPrice}
                projectId={currentProjectId}
                onPromoteToContract={handlePromoteToContract}
                isLocked={isLocked}
                onUnlock={handleUnlock}
              />
            </div>
          </div>

          {/* Output Column */}
          <div className="col-span-12 lg:col-span-6">
            <div className="lg:sticky lg:top-28 h-[calc(100vh-160px)] flex flex-col">
              {activeTab === 'calculator' ? (
                <div className="flex flex-col h-full">
                  <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl flex-1 overflow-y-auto custom-scrollbar">
                    <OutputPanel 
                      result={result} 
                      invoices={config.invoices}
                    />
                  </div>

                  {/* Quick summary bar */}
                  <div className="mt-4 bg-nw-black text-nw-bone p-4 font-mono text-[10px] uppercase track-widest flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse"></span>
                      Live calculation
                    </span>
                    <span className="text-nw-acid">
                      {result.adjustedHours}h · {config.features.length} features
                    </span>
                  </div>
                </div>
              ) : (
                <LivePreview 
                  mode={activeTab}
                  input={config}
                  result={result}
                  projectId={sessionId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Hidden template for PDF generation */}
        <QuoteTemplate 
          mode={activeTab === 'calculator' ? 'quote' : activeTab}
          input={config} 
          result={result} 
          projectId={sessionId}
        />
      </div>
    </section>
  );
}
