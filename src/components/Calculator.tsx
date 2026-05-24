"use client";

import { useState, useMemo } from "react";
import { calculate } from "@/lib/calculator";
import { TEMPLATES } from "@/lib/constants";
import InputPanel from "./InputPanel";
import OutputPanel from "./OutputPanel";
import LivePreview from "./LivePreview";
import QuoteTemplate from "./QuoteTemplate";
import { Icon } from "@iconify/react";
import ProjectLibraryModal from "@/components/calculator/ProjectLibraryModal";
import NewProjectModal from "@/components/calculator/NewProjectModal";
import { useCalculatorProject } from "@/hooks/useCalculatorProject";
import { usePdfExport } from "@/hooks/usePdfExport";

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<"calculator" | "proposal" | "contract">("calculator");
  const project = useCalculatorProject();

  const {
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
  } = project;

  const result = useMemo(() => calculate(config), [config]);
  const { exportToPdf } = usePdfExport(config, result, currentProjectId);

  const onPromoteToContract = () => {
    if (handlePromoteToContract()) setActiveTab("contract");
  };

  return (
    <section className="pt-8 pb-[clamp(3rem,6vw,6rem)] relative">
      <div className="absolute inset-0 bg-tech-grid opacity-40 pointer-events-none" />

      <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
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
              type="button"
              onClick={handleNew}
              className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-transparent text-nw-graphite border border-nw-graphite/20 hover:border-nw-black hover:text-nw-black transition-all"
            >
              <Icon icon="solar:document-add-linear" />
              New Project
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 transition-all ${
                isSaving
                  ? "bg-nw-graphite/20 text-nw-graphite cursor-not-allowed border border-transparent"
                  : "bg-nw-black text-nw-bone border border-nw-black hover:bg-nw-acid hover:border-nw-acid"
              }`}
            >
              <Icon
                icon={isSaving ? "solar:refresh-linear" : "solar:diskette-linear"}
                className={isSaving ? "animate-spin" : ""}
              />
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
          </div>

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
              <option value="" disabled>
                Select Starting Point...
              </option>
              {TEMPLATES.map((t) => (
                <option key={t.label} value={JSON.stringify(t.config)} className="bg-nw-bone">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentProjectId && (
              <button
                type="button"
                onClick={() => handleCopyMagicLink(activeTab)}
                className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-nw-bone text-nw-acid border border-nw-acid hover:bg-nw-acid hover:text-nw-bone transition-all group"
              >
                <Icon icon="solar:link-linear" className="group-hover:scale-110 transition-transform" />
                {activeTab === "contract" ? "View Link" : "Magic Link"}
              </button>
            )}

            {currentProjectId && activeTab === "contract" && (
              <button
                type="button"
                onClick={handleCopySignLink}
                className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-nw-black text-nw-bone border border-nw-black hover:bg-nw-acid hover:text-nw-black transition-all group"
              >
                <Icon icon="solar:pen-new-square-linear" className="group-hover:scale-110 transition-transform" />
                Sign Link
              </button>
            )}

            <button
              type="button"
              onClick={() => exportToPdf(activeTab)}
              className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-transparent text-nw-black border border-nw-black hover:bg-nw-black hover:text-nw-bone transition-all"
            >
              <Icon icon="solar:download-minimalistic-linear" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="mb-12 flex border-b border-nw-graphite/20 no-print">
          {(["calculator", "proposal", "contract"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
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

        {showLibrary && (
          <ProjectLibraryModal
            projects={projects}
            onClose={() => setShowLibrary(false)}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        )}

        {showNewModal && (
          <NewProjectModal
            newProjectInfo={newProjectInfo}
            onChange={setNewProjectInfo}
            onClose={() => setShowNewModal(false)}
            onConfirm={confirmNewProject}
          />
        )}

        <div id="calculator-content" className="grid grid-cols-12 gap-[clamp(1.5rem,3vw,2.5rem)]">
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-nw-graphite/20 pb-4">
                <div className="font-mono text-xs text-nw-black uppercase track-widest flex items-center gap-2">
                  <Icon icon="solar:settings-linear" />
                  scope.config
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full" />
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full" />
                  <div className="w-3 h-3 bg-nw-emerald rounded-full animate-pulse" />
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
                onPromoteToContract={onPromoteToContract}
                isLocked={isLocked}
                onUnlock={handleUnlock}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="lg:sticky lg:top-28 h-[calc(100vh-160px)] flex flex-col">
              {activeTab === "calculator" ? (
                <div className="flex flex-col h-full">
                  <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl flex-1 overflow-y-auto custom-scrollbar">
                    <OutputPanel
                      result={result}
                      currency={config.currency}
                      invoices={config.invoices}
                    />
                  </div>
                  <div className="mt-4 bg-nw-black text-nw-bone p-4 font-mono text-[10px] uppercase track-widest flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse" />
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
                  isApproved={!!currentProject?.isApproved}
                  signedBy={currentProject?.signedBy}
                  approvedAt={currentProject?.approvedAt}
                />
              )}
            </div>
          </div>
        </div>

        <QuoteTemplate
          mode={activeTab === "calculator" ? "quote" : activeTab}
          input={config}
          result={result}
          projectId={sessionId}
        />
      </div>
    </section>
  );
}
