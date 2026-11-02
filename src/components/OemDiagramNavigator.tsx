import React, { useState } from 'react';
import { 
  OEM_DIAGRAM_IMAGE_PATH, 
  OEM_DIAGRAM_HOTSPOTS, 
  DiagramHotspot, 
  HARNESS_NODES,
  DiagnosticFault,
  PinDefinition 
} from '../data/electricalData';
import { 
  FileText, 
  X, 
  Focus, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Zap, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface OemDiagramNavigatorProps {
  onClose: () => void;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  activeFault: DiagnosticFault | null;
  activePin: PinDefinition | null;
}

export const OemDiagramNavigator: React.FC<OemDiagramNavigatorProps> = ({
  onClose,
  selectedNodeId,
  onSelectNode,
  activeFault,
  activePin,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedHotspot, setSelectedHotspot] = useState<DiagramHotspot>(
    OEM_DIAGRAM_HOTSPOTS.find((h) => h.nodeId === selectedNodeId) || OEM_DIAGRAM_HOTSPOTS[12] // default to 82114 Red Circled Joint
  );
  const [filterHarness, setFilterHarness] = useState<'all' | '82111' | '82114'>('all');

  const handleHotspotClick = (hotspot: DiagramHotspot) => {
    setSelectedHotspot(hotspot);
    onSelectNode(hotspot.nodeId);
  };

  const activeNode = HARNESS_NODES.find((n) => n.id === selectedHotspot.nodeId);

  return (
    <div className="absolute inset-0 bg-neutral-950/98 backdrop-blur-md z-40 flex flex-col p-3 md:p-6 select-none overflow-hidden animate-in fade-in">
      {/* Modal Top Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 uppercase font-bold">
              TOYOTA FACTORY MASTER FRAME
            </span>
            <span className="text-neutral-400 text-xs hidden sm:inline">
              Engine Room Wire #5 · Main Harness 82111 & Front Harness 82114
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>OEM Schematic Blueprint Frame & Interactive Harness Junctions</span>
          </h2>
        </div>

        {/* Controls: Zoom, Harness Filter & Close */}
        <div className="flex items-center gap-2">
          {/* Harness Filter */}
          <div className="flex items-center gap-0.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
            <button
              onClick={() => setFilterHarness('all')}
              className={`px-2 py-0.5 rounded transition ${
                filterHarness === 'all' ? 'bg-sky-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Runs
            </button>
            <button
              onClick={() => setFilterHarness('82111')}
              className={`px-2 py-0.5 rounded transition ${
                filterHarness === '82111' ? 'bg-sky-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              82111 (Main)
            </button>
            <button
              onClick={() => setFilterHarness('82114')}
              className={`px-2 py-0.5 rounded transition ${
                filterHarness === '82114' ? 'bg-amber-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              82114 (Front)
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
              className="p-1 text-neutral-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-neutral-300 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              className="p-1 text-neutral-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg border border-neutral-700 transition"
            title="Return to 3D Viewport"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Left Interactive Diagram Canvas + Right Component Intel Panel */}
      <div className="flex-1 bg-neutral-950 border-x border-b border-neutral-800 rounded-b-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left: High-Resolution Diagram Frame with Interactive Callout Pins */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gradient-to-b from-[#090d16] to-[#040711] relative">
          <div 
            className="relative transition-transform duration-150 shadow-2xl rounded-xl overflow-hidden border border-neutral-800/80 bg-white"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              maxWidth: '920px',
              width: '100%'
            }}
          >
            {/* The Actual User-Supplied Toyota Factory Blueprint Image */}
            <img 
              src={OEM_DIAGRAM_IMAGE_PATH} 
              alt="Toyota Corolla Engine Room Wire #5 Diagram"
              className="w-full h-auto block select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* Interactive Hotspot Callout Overlays */}
            {OEM_DIAGRAM_HOTSPOTS.map((hotspot) => {
              if (filterHarness !== 'all' && hotspot.harness !== filterHarness) {
                return null;
              }

              const isSelected = selectedHotspot?.callout === hotspot.callout;
              const isFaulted = activeFault && activeFault.affectedNodeId === hotspot.nodeId;

              return (
                <button
                  key={hotspot.callout}
                  onClick={() => handleHotspotClick(hotspot)}
                  style={{
                    left: `${hotspot.xPercent}%`,
                    top: `${hotspot.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-10 transition-all duration-150 flex items-center justify-center rounded-full font-mono font-bold text-[10px] cursor-pointer shadow-xl ${
                    hotspot.isRedCircledArea
                      ? 'w-10 h-10 ring-4 ring-red-500 bg-red-600/90 text-white animate-pulse'
                      : isSelected
                      ? 'w-7 h-7 ring-2 ring-sky-400 bg-sky-600 text-white scale-125 z-20'
                      : isFaulted
                      ? 'w-6 h-6 bg-red-600 text-white animate-bounce'
                      : hotspot.harness === '82114'
                      ? 'w-6 h-6 bg-amber-500/90 hover:bg-amber-400 text-neutral-950 hover:scale-110'
                      : 'w-6 h-6 bg-sky-900/90 hover:bg-sky-600 text-sky-200 hover:text-white hover:scale-110'
                  }`}
                  title={`${hotspot.callout}: ${hotspot.name} (${hotspot.partNumber}) - Click to inspect`}
                >
                  {hotspot.callout.length > 5 ? (
                    <span className="text-[8px] leading-tight text-center px-1">
                      {hotspot.callout.includes('Joint') ? 'JOINT' : hotspot.callout}
                    </span>
                  ) : (
                    <span>{hotspot.callout}</span>
                  )}

                  {/* Red Circle Indicator Icon */}
                  {hotspot.isRedCircledArea && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Component Detail Intel Panel */}
        <div className="w-full md:w-88 bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-800 p-4 space-y-4 overflow-y-auto shrink-0 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Header info for selected hotspot */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-sky-500/20 text-sky-400 border border-sky-500/40">
                  HARNESS {selectedHotspot.harness}
                </span>
                {selectedHotspot.isRedCircledArea && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    DIAGRAM MARKED AREA
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-sky-400 text-xs font-bold">
                  {selectedHotspot.callout}
                </span>
                <span>{selectedHotspot.name}</span>
              </h3>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                {selectedHotspot.description}
              </p>
            </div>

            {/* Technical Fastener & Spec Badges */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Toyota Sub-Part:</span>
                <span className="text-sky-300 font-bold">{selectedHotspot.partNumber}</span>
              </div>
              {selectedHotspot.fastener && (
                <div className="flex items-center justify-between border-t border-neutral-900 pt-1.5">
                  <span className="text-neutral-500">Fastener Bolt:</span>
                  <span className="text-amber-400 font-bold">{selectedHotspot.fastener}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-neutral-900 pt-1.5">
                <span className="text-neutral-500">Terminal Count:</span>
                <span className="text-emerald-400 font-bold">{activeNode?.pins.length || 4} Pins</span>
              </div>
            </div>

            {/* Active Pinout Summary */}
            {activeNode && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-neutral-400 font-semibold uppercase tracking-wider">
                  Associated Terminals
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {activeNode.pins.map((p) => (
                    <div 
                      key={p.pin}
                      className="p-2 bg-neutral-950/80 rounded-lg border border-neutral-800 text-[11px] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-sky-400 font-bold mr-1.5">{p.pin}:</span>
                        <span className="text-neutral-200">{p.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400">{p.nominalVoltage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <button
              onClick={() => {
                onSelectNode(selectedHotspot.nodeId);
                onClose();
              }}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-1.5"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>Inspect in 3D Engine Viewport</span>
            </button>
            <div className="text-[10px] font-mono text-neutral-500 text-center">
              ISO 6722-1 · Toyota Corolla E210 Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
