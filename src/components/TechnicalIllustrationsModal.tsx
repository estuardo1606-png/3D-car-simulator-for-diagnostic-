import React, { useState } from 'react';
import { DiagnosticFault, HARNESS_NODES, PinDefinition } from '../data/electricalData';
import { TechnicalIllustration } from './TechnicalIllustrations';
import { 
  FileImage, 
  X, 
  Focus, 
  Layers, 
  Zap, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface TechnicalIllustrationsModalProps {
  onClose: () => void;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  activeFault: DiagnosticFault | null;
  activePin: PinDefinition | null;
}

export const TechnicalIllustrationsModal: React.FC<TechnicalIllustrationsModalProps> = ({
  onClose,
  selectedNodeId,
  onSelectNode,
  activeFault,
  activePin,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>(selectedNodeId || 'coils_pack');

  const componentsList = [
    { id: 'coils_pack', name: 'Ignition Coil COP (1-4)', desc: 'Denso 4-Pin Sealed Unit with IGBT Igniter', badge: 'Ignition' },
    { id: 'throttle_etcs', name: 'ETCS-i Electronic Throttle', desc: 'DC Servo Motor & Dual Hall TPS (VTA1/VTA2)', badge: 'Throttle' },
    { id: 'ecm', name: 'Engine Control Module (ECM)', desc: 'Denso 32-Bit Microcomputer Header A24', badge: 'Control' },
    { id: 'alternator', name: 'Smart Alternator 140A', desc: 'Segment Conductor Hairpin & LIN Regulator', badge: 'Charging' },
    { id: 'fusebox', name: 'Engine Junction Block No. 1', desc: '140A ALT Fusible Link & Micro ISO Relays', badge: 'Power' },
    { id: 'knock_sensor', name: 'Ground Stud EC & Knock Sensor', desc: 'Cylinder Head M8 Boss & Piezo Acoustic Coaxial', badge: 'Grounds' },
  ];

  const currentComponent = componentsList.find((c) => c.id === currentNodeId) || componentsList[0];

  return (
    <div className="absolute inset-0 bg-neutral-950/98 backdrop-blur-md z-40 flex flex-col p-3 md:p-6 select-none overflow-hidden animate-in fade-in">
      {/* Modal Top Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 uppercase font-bold">
              TOYOTA FACTORY SERVICE BLUEPRINTS
            </span>
            <span className="text-neutral-400 text-xs hidden sm:inline">Engine M20A-FKS 2.0L · ISO Technical Standards</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <FileImage className="w-4 h-4 text-sky-400" />
            <span>OEM Technical Cutaway Illustrations & Anatomical Architecture</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSelectNode(currentNodeId);
              onClose();
            }}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition"
            title="Focus this component in the 3D Viewport"
          >
            <Focus className="w-3.5 h-3.5 text-sky-400" />
            <span>Focus in 3D</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg border border-neutral-700 transition"
            title="Close Technical Blueprints"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Split: Left Component Selector + Right High-Res Blueprint */}
      <div className="flex-1 bg-neutral-950 border-x border-b border-neutral-800 rounded-b-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Component Navigation Sidebar */}
        <div className="w-full md:w-72 bg-neutral-900/60 border-b md:border-b-0 md:border-r border-neutral-800 p-3 space-y-1.5 overflow-y-auto shrink-0">
          <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider px-1 mb-2">
            Engineering Diagrams ({componentsList.length})
          </div>

          {componentsList.map((comp) => {
            const isSelected = comp.id === currentNodeId;
            const isFaulted = activeFault && activeFault.affectedNodeId === comp.id;

            return (
              <div
                key={comp.id}
                onClick={() => setCurrentNodeId(comp.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500 shadow-md'
                    : isFaulted
                    ? 'bg-red-950/50 border-red-500/60'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{comp.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400 border border-neutral-700 uppercase">
                    {comp.badge}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{comp.desc}</div>
                {isFaulted && (
                  <div className="text-[10px] text-red-400 font-mono mt-1 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                    <span>Fault: {activeFault.code}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Area: High-Resolution Technical Illustration */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#020612] to-[#040817]">
          <div className="w-full max-w-4xl">
            <TechnicalIllustration
              nodeId={currentNodeId}
              activeFault={activeFault}
              activePin={activePin}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
