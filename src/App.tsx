import React, { useState } from 'react';
import { 
  HARNESS_NODES, 
  HarnessNode, 
  PinDefinition, 
  SubsystemCategory, 
  DiagnosticFault,
  DIAGNOSTIC_FAULTS 
} from './data/electricalData';
import { TopBar } from './components/TopBar';
import { Viewport3D } from './components/Viewport3D';
import { LeftSidebar } from './components/LeftSidebar';
import { OscilloscopeDMM } from './components/OscilloscopeDMM';
import { ConnectorPinoutInspector } from './components/ConnectorPinoutInspector';
import { FaultSimulator } from './components/FaultSimulator';
import { EwdSchematicViewer } from './components/EwdSchematicViewer';
import { TechnicalIllustrationsModal } from './components/TechnicalIllustrationsModal';
import { OemDiagramNavigator } from './components/OemDiagramNavigator';
import { Sliders, Wrench, FileText, FileImage, Layers, ChevronRight, ChevronLeft } from 'lucide-react';

export default function App() {
  // Navigation and active states
  const [selectedNodeId, setSelectedNodeId] = useState<string>('junction_82114'); // default to diagram marked joint
  const [activeFilter, setActiveFilter] = useState<SubsystemCategory>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Fault simulation states
  const [activeFault, setActiveFault] = useState<DiagnosticFault | null>(null);
  const [customResistance, setCustomResistance] = useState<number>(0.02);
  const [signalSimActive, setSignalSimActive] = useState<boolean>(true);

  // Active Pin probe for oscilloscope
  const defaultNode = HARNESS_NODES.find((n) => n.id === 'junction_82114') || HARNESS_NODES[0];
  const [activePin, setActivePin] = useState<PinDefinition | null>(defaultNode.pins[0]);

  // UI Panels toggles
  const [isDiagramNavigatorOpen, setIsDiagramNavigatorOpen] = useState(false);
  const [isSchematicsOpen, setIsSchematicsOpen] = useState(false);
  const [isIllustrationsOpen, setIsIllustrationsOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'inspector' | 'simulator'>('inspector');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isOscilloscopeExpanded, setIsOscilloscopeExpanded] = useState(true);

  // Current selected node
  const currentNode = HARNESS_NODES.find((n) => n.id === selectedNodeId) || defaultNode;

  // Handler for node selection
  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = HARNESS_NODES.find((n) => n.id === nodeId);
    if (node && node.pins.length > 0) {
      setActivePin(node.pins[0]);
    }
    setRightPanelTab('inspector');
    setIsRightPanelOpen(true);
  };

  // Handler for fault selection
  const handleSelectFault = (fault: DiagnosticFault | null) => {
    setActiveFault(fault);
    if (fault) {
      // Focus on the faulted node automatically
      setSelectedNodeId(fault.affectedNodeId);
      const targetNode = HARNESS_NODES.find((n) => n.id === fault.affectedNodeId);
      if (targetNode) {
        const pin = targetNode.pins.find((p) => p.pin === fault.affectedPin) || targetNode.pins[0];
        setActivePin(pin);
      }
    }
  };

  const handleResetView = () => {
    setSelectedNodeId('junction_82114');
    setActiveFilter('all');
    setActiveFault(null);
    setCustomResistance(0.02);
    setActivePin(defaultNode.pins[0]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* 1. Header (Following Top Bar Contract) */}
      <TopBar
        onToggleDiagramNavigator={() => setIsDiagramNavigatorOpen(!isDiagramNavigatorOpen)}
        isDiagramNavigatorOpen={isDiagramNavigatorOpen}
        onToggleSchematics={() => setIsSchematicsOpen(!isSchematicsOpen)}
        isSchematicsOpen={isSchematicsOpen}
        onToggleSimulator={() => {
          setRightPanelTab('simulator');
          setIsRightPanelOpen(true);
        }}
        isSimulatorOpen={isRightPanelOpen && rightPanelTab === 'simulator'}
        onToggleIllustrations={() => setIsIllustrationsOpen(!isIllustrationsOpen)}
        isIllustrationsOpen={isIllustrationsOpen}
        onResetView={handleResetView}
        activeFaultCount={activeFault ? 1 : 0}
      />

      {/* 2. Main Diagnostic Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Component Tree, Fuses, Wire Colors */}
        <LeftSidebar
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeFault={activeFault}
          isOpen={isLeftSidebarOpen}
          onToggleOpen={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        />

        {/* Center: 3D Engine Viewport & Oscilloscope / DMM Dock */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          {/* 3D WebGL Canvas */}
          <div className="flex-1 relative min-h-[300px]">
            <Viewport3D
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              activeFilter={activeFilter}
              activeFault={activeFault}
              signalSimActive={signalSimActive}
              onToggleSignalSim={() => setSignalSimActive(!signalSimActive)}
              hoveredNodeId={hoveredNodeId}
              setHoveredNodeId={setHoveredNodeId}
            />

            {/* Quick Action Overlay Strip */}
            <div className="absolute top-16 left-4 flex flex-wrap items-center gap-2 pointer-events-auto z-10">
              {/* Master Diagram Frame Opener */}
              <button
                onClick={() => setIsDiagramNavigatorOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-sky-500/50 bg-sky-950/90 hover:bg-sky-900 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-sky-950/40"
                title="Inspect Master Toyota Parts Diagram with Callout Hotspots"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>OEM Diagram Frame</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Red circled joint marked"></span>
              </button>

              <button
                onClick={() => {
                  setRightPanelTab('simulator');
                  setIsRightPanelOpen(true);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition shadow-lg ${
                  activeFault
                    ? 'bg-red-950/90 text-red-200 border-red-500/70 animate-pulse'
                    : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Fault Simulation Engine</span>
                {activeFault && (
                  <span className="ml-1 text-[10px] font-mono text-red-300 font-bold">({activeFault.code})</span>
                )}
              </button>

              <button
                onClick={() => setIsIllustrationsOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-lg"
              >
                <FileImage className="w-3.5 h-3.5 text-sky-400" />
                <span>OEM Blueprints</span>
              </button>

              <button
                onClick={() => setIsSchematicsOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-lg"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wiring EWD</span>
              </button>
            </div>
          </div>

          {/* Bottom Dock: Live Oscilloscope & Precision Multimeter */}
          {isOscilloscopeExpanded && (
            <div className="h-56 md:h-64 border-t border-neutral-800 shrink-0 relative z-20">
              <OscilloscopeDMM
                activePin={activePin}
                activeFault={activeFault}
                customResistance={customResistance}
              />
            </div>
          )}
        </div>

        {/* Right Panel: Split between Pinout Inspector & Fault Simulation */}
        {isRightPanelOpen && (
          <aside className="w-88 md:w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col shrink-0 z-20 shadow-2xl relative">
            {/* Panel Tab Switcher */}
            <div className="flex border-b border-neutral-800 bg-neutral-950/80 text-xs font-semibold shrink-0">
              <button
                onClick={() => setRightPanelTab('inspector')}
                className={`flex-1 py-2.5 text-center transition ${
                  rightPanelTab === 'inspector'
                    ? 'text-sky-400 border-b-2 border-sky-500 bg-neutral-900'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Connector & Blueprint
              </button>
              <button
                onClick={() => setRightPanelTab('simulator')}
                className={`flex-1 py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'simulator'
                    ? 'text-amber-400 border-b-2 border-amber-500 bg-neutral-900'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Fault Simulator</span>
                {activeFault && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-hidden">
              {rightPanelTab === 'inspector' ? (
                <ConnectorPinoutInspector
                  node={currentNode}
                  activePin={activePin}
                  onSelectPin={(pin) => setActivePin(pin)}
                  activeFault={activeFault}
                  customResistance={customResistance}
                  onClose={() => setIsRightPanelOpen(false)}
                  onFocus3D={() => {
                    // Node is already selected, viewport will react
                  }}
                />
              ) : (
                <FaultSimulator
                  activeFault={activeFault}
                  onSelectFault={handleSelectFault}
                  customResistance={customResistance}
                  onCustomResistanceChange={setCustomResistance}
                  onFocusFaultIn3D={(nodeId) => handleSelectNode(nodeId)}
                />
              )}
            </div>
          </aside>
        )}

        {/* Right Panel Toggle Tab (when panel is collapsed) */}
        {!isRightPanelOpen && (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute top-20 right-0 bg-neutral-900 border-y border-l border-neutral-800 text-neutral-400 hover:text-white p-2 rounded-l-lg shadow-xl z-20 transition"
            title="Open Inspector & Simulator"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Master OEM Diagram Blueprint Navigator Modal */}
        {isDiagramNavigatorOpen && (
          <OemDiagramNavigator
            onClose={() => setIsDiagramNavigatorOpen(false)}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            activeFault={activeFault}
            activePin={activePin}
          />
        )}

        {/* Dedicated Fullscreen OEM Technical Cutaway Blueprints Studio */}
        {isIllustrationsOpen && (
          <TechnicalIllustrationsModal
            onClose={() => setIsIllustrationsOpen(false)}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            activeFault={activeFault}
            activePin={activePin}
          />
        )}

        {/* Fullscreen Interactive EWD Vector Schematic Viewer */}
        {isSchematicsOpen && (
          <EwdSchematicViewer
            onClose={() => setIsSchematicsOpen(false)}
            activeFault={activeFault}
            onSelectNode={handleSelectNode}
          />
        )}
      </div>
    </div>
  );
}
