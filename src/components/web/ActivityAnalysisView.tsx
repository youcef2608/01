import React, { useState, useEffect } from 'react';
import { ActivityEvaluation, Call } from '../../types';
import { AnalysisSidebar } from './analysis/AnalysisSidebar';
import { AnalysisDetailStage } from './analysis/AnalysisDetailStage';
import { NewAnalysisModal } from './analysis/NewAnalysisModal';
import { 
  BrainCircuit, 
  Sparkles, 
  Plus, 
  RefreshCw,
  SlidersHorizontal,
  Bot
} from 'lucide-react';

interface ActivityAnalysisViewProps {
  evaluations: ActivityEvaluation[];
  calls: Call[];
  onAddEvaluation: (evaluation: ActivityEvaluation) => void;
  onUpdateEvaluation?: (evaluation: ActivityEvaluation) => void;
  onOpenCreateCall: () => void;
}

export const ActivityAnalysisView: React.FC<ActivityAnalysisViewProps> = ({
  evaluations,
  calls,
  onAddEvaluation,
  onUpdateEvaluation,
  onOpenCreateCall
}) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<ActivityEvaluation | null>(
    evaluations[0] || null
  );
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // AI Connection State
  const [aiStatus, setAiStatus] = useState<{
    ready: boolean;
    model: string;
    hasKey: boolean;
  }>({
    ready: true,
    model: 'Gemini 3.8 Flash',
    hasKey: true
  });

  // Verify server AI status on mount
  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => {
        if (data.model) {
          setAiStatus({
            ready: Boolean(data.ready),
            model: data.model === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : data.model,
            hasKey: Boolean(data.hasKey)
          });
        }
      })
      .catch(() => {
        // Fallback default
      });
  }, []);

  // Update evaluation locally in state
  const handleUpdateEvaluation = (updated: ActivityEvaluation) => {
    setSelectedEvaluation(updated);
    if (onUpdateEvaluation) {
      onUpdateEvaluation(updated);
    }
  };

  const handleAddEvaluation = (newEval: ActivityEvaluation) => {
    onAddEvaluation(newEval);
    setSelectedEvaluation(newEval);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Real AI Engine Header */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-stone-900/80 via-purple-950/25 to-stone-900/80 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>محرك الذكاء الاصطناعي التشغيلي الحقيقي للجمعيات</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              تحليل تجارب الأنشطة والمبادرات بـ Gemini AI
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              منظومة متكاملة لتقييم الأنشطة الميدانية بعد تنفيذها. يسجّل الفريق ما نجح وما واجههم من عقبات، ليقوم الذكاء الاصطناعي بتشخيص التجربة، استخراج الدروس الوقائية، وتقديم استشارات حية للجمعيات الشريكة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>توثيق وتحليل نشاط جديد</span>
            </button>

            <div className="px-3.5 py-2 rounded-2xl bg-stone-950/60 border border-white/10 flex items-center gap-2 text-xs">
              <Bot className="w-4 h-4 text-emerald-400" />
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block leading-none">النموذج النشط</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{aiStatus.model}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: Side List (Sidebar) on Side + Main Analysis Stage */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Dedicated Analysis Sidebar (القائمة الجانبية للتحليلات) */}
        <AnalysisSidebar
          evaluations={evaluations}
          selectedEvaluation={selectedEvaluation}
          onSelectEvaluation={ev => setSelectedEvaluation(ev)}
          onOpenNewModal={() => setShowNewModal(true)}
          aiStatus={aiStatus}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Main Interactive Stage for Selected Analysis (منصة التحليل التفاعلية) */}
        <AnalysisDetailStage
          evaluation={selectedEvaluation}
          calls={calls}
          onUpdateEvaluation={handleUpdateEvaluation}
          onOpenCreateCall={onOpenCreateCall}
          allEvaluations={evaluations}
        />
      </div>

      {/* New Analysis Modal */}
      <NewAnalysisModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onAddEvaluation={handleAddEvaluation}
        calls={calls}
        allEvaluations={evaluations}
      />
    </div>
  );
};

export default ActivityAnalysisView;
