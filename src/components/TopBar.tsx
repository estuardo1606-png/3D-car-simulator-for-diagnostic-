import React from 'react';
import { 
  Zap, 
  Menu, 
  X, 
  Activity, 
  RotateCcw,
  Sliders,
  FileText,
  FileImage,
  Layers
} from 'lucide-react';

interface TopBarProps {
  onToggleSchematics: () => void;
  isSchematicsOpen: boolean;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
  onToggleIllustrations: () => void;
  isIllustrationsOpen: boolean;
  onToggleDiagramNavigator: () => void;
  isDiagramNavigatorOpen: boolean;
  onResetView: () => void;
  activeFaultCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSchematics,
  isSchematicsOpen,
  onToggleSimulator,
  isSimulatorOpen,
  onToggleIllustrations,
  isIllustrationsOpen,
  onToggleDiagramNavigator,
  isDiagramNavigatorOpen,
  onResetView,
  activeFaultCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-8 px-4 md:px-6 shrink-0 z-30 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-black tracking-wider text-white shadow-md shadow-sky-600/30 shrink-0">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <a href="/" className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          AeroVolt Diagnostics
        </a>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={onToggleDiagramNavigator}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            isDiagramNavigatorOpen ? 'text-sky-400 font-semibold' : ''
          }`}
          title="Open Master Toyota Diagram (Engine Room Wire #5)"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Diagram Frame</span>
        </button>
        <button
          onClick={onToggleSimulator}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            isSimulatorOpen ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          <span>Fault Simulation</span>
          {activeFaultCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={onToggleIllustrations}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            isIllustrationsOpen ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          <FileImage className="w-3.5 h-3.5" />
          <span>OEM Blueprints</span>
        </button>
        <button
          onClick={onToggleSchematics}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            isSchematicsOpen ? 'text-sky-400 font-semibold' : ''
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Wiring EWD</span>
        </button>
        <a
          href="#harness-specs"
          onClick={(e) => { e.preventDefault(); onToggleDiagramNavigator(); }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Wire 82111 / 82114
        </a>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onResetView}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          title="Reset Camera & Selection"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Reset Bay View</span>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-neutral-900 border-b border-neutral-800 p-4 space-y-3 md:hidden shadow-2xl z-40 animate-in slide-in-from-top-2">
          <button
            onClick={() => { onToggleDiagramNavigator(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-neutral-200 hover:bg-neutral-800 flex items-center justify-between font-medium"
          >
            <span>Master Diagram Frame (82111/82114)</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </button>
          <button
            onClick={() => { onToggleSimulator(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-neutral-200 hover:bg-neutral-800 flex items-center justify-between font-medium"
          >
            <span>Fault Simulation Console</span>
            {activeFaultCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                {activeFaultCount} Active
              </span>
            )}
          </button>
          <button
            onClick={() => { onToggleIllustrations(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-neutral-200 hover:bg-neutral-800 flex items-center justify-between font-medium"
          >
            <span>OEM Technical Blueprints</span>
            <FileImage className="w-4 h-4 text-sky-400" />
          </button>
          <button
            onClick={() => { onToggleSchematics(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-neutral-200 hover:bg-neutral-800 flex items-center justify-between font-medium"
          >
            <span>Wiring EWD Schematics</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </button>
          <button
            onClick={() => { onResetView(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-neutral-200 hover:bg-neutral-800 flex items-center justify-between font-medium"
          >
            <span>Reset Camera</span>
            <RotateCcw className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      )}
    </header>
  );
};
