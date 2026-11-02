import React, { useState } from 'react';
import { HarnessNode, PinDefinition, TOYOTA_WIRE_COLORS, DiagnosticFault } from '../data/electricalData';
import { TechnicalIllustration } from './TechnicalIllustrations';
import { 
  Zap, 
  ShieldAlert, 
  CheckCircle, 
  Info, 
  Sliders, 
  Focus,
  X,
  FileImage,
  Layers
} from 'lucide-react';

interface ConnectorPinoutInspectorProps {
  node: HarnessNode;
  activePin: PinDefinition | null;
  onSelectPin: (pin: PinDefinition) => void;
  activeFault: DiagnosticFault | null;
  customResistance: number;
  onClose: () => void;
  onFocus3D: () => void;
}

export const ConnectorPinoutInspector: React.FC<ConnectorPinoutInspectorProps> = ({
  node,
  activePin,
  onSelectPin,
  activeFault,
  customResistance,
  onClose,
  onFocus3D,
}) => {
  const [activeView, setActiveView] = useState<'illustration' | 'matrix'>('illustration');
  const isNodeFaulted = activeFault && activeFault.affectedNodeId === node.id;

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800 text-xs select-none">
      {/* Connector Header */}
      <div className="p-3.5 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/70 border border-sky-800/70 px-1.5 py-0.5 rounded font-bold uppercase">
              {node.type}
            </span>
            <span className="text-neutral-400 font-mono text-[11px]">{node.housingType}</span>
          </div>
          <h2 className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
            {node.name}
            {isNodeFaulted && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onFocus3D}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
            title="Focus camera on this connector in 3D"
          >
            <Focus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Switcher: Real Technical Illustration vs Terminal Matrix */}
      <div className="px-3.5 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0">
        <span className="text-[11px] font-mono text-neutral-400">Visualization:</span>
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-[11px] font-mono">
          <button
            onClick={() => setActiveView('illustration')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              activeView === 'illustration'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>OEM Technical Blueprint</span>
          </button>
          <button
            onClick={() => setActiveView('matrix')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              activeView === 'matrix'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pin Cavities</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display (Real Technical Illustration OR Pin Cavity Grid) */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-950/40 shrink-0">
        {activeView === 'illustration' ? (
          <TechnicalIllustration
            nodeId={node.id}
            activeFault={activeFault}
            activePin={activePin}
            onSelectPinByName={(pinName) => {
              const p = node.pins.find((pin) => pin.pin.includes(pinName) || pin.name.includes(pinName));
              if (p) onSelectPin(p);
            }}
          />
        ) : (
          <div className="w-full p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
              <span>Terminal Face Matrix (Front View)</span>
              <span className="text-sky-400">{node.sealRating}</span>
            </div>

            {/* Connector top latch lock simulation */}
            <div className="w-10 h-1.5 bg-neutral-700 rounded-t border-t border-x border-neutral-500 mb-1"></div>

            {/* Pin Cavities Grid */}
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[320px] p-2 bg-neutral-950 rounded-lg border border-neutral-800">
              {node.pins.map((p, idx) => {
                const colorObj = TOYOTA_WIRE_COLORS[p.colorCode] || { hex: '#475569', textColor: '#ffffff' };
                const isSelected = activePin?.pin === p.pin;
                const isFaultedPin = isNodeFaulted && activeFault?.affectedPin === p.pin;

                return (
                  <button
                    key={p.pin}
                    onClick={() => onSelectPin(p)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-[10px] transition-all shadow-md relative ${
                      isSelected
                        ? 'ring-2 ring-sky-400 scale-110 z-10'
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: colorObj.hex,
                      color: colorObj.textColor,
                      border: `1.5px solid ${colorObj.stripe || '#334155'}`,
                    }}
                    title={`${p.pin}: ${p.name} (${p.colorCode}) - Click to Probe`}
                  >
                    <span>{idx + 1}</span>
                    {isFaultedPin && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-neutral-950 animate-ping"></span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-1.5">
              Active Probe: <strong className="text-sky-400">{activePin?.pin || node.pins[0]?.pin}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Pinout Details Table */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
          <span>Terminal Assignment & Specs</span>
          <span className="text-neutral-500">{node.pins.length} Pins</span>
        </div>

        {node.pins.map((p) => {
          const colorObj = TOYOTA_WIRE_COLORS[p.colorCode] || { name: p.colorCode, hex: '#475569', textColor: '#ffffff' };
          const isSelected = activePin?.pin === p.pin;
          const isFaultedPin = isNodeFaulted && activeFault?.affectedPin === p.pin;

          return (
            <div
              key={p.pin}
              onClick={() => onSelectPin(p)}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800 border-sky-500 shadow-sm'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60 text-[10px]">
                      {p.pin}
                    </span>
                    <span className="font-semibold text-white">{p.name}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">{p.func}</p>
                </div>

                {/* Wire Color Code Tag with Stripe */}
                <div className="text-right shrink-0">
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[10px] border shadow-sm"
                    style={{
                      backgroundColor: colorObj.hex,
                      color: colorObj.textColor,
                      borderColor: colorObj.stripe || '#475569',
                    }}
                  >
                    <span>{p.colorCode}</span>
                    {colorObj.stripe && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorObj.stripe }}></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Voltage Specs vs Live Reading */}
              <div className="mt-2 pt-1.5 border-t border-neutral-850 flex items-center justify-between font-mono text-[10px]">
                <span className="text-neutral-500">Spec: {p.nominalVoltage}</span>
                <span className={isFaultedPin ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {isFaultedPin ? activeFault?.anomalousVoltage : 'Pass (Nominal)'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Back-Probe Diagnostic Notice */}
        <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
          <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>OEM Back-Probe Instruction:</span>
          </div>
          <p>{node.diagnosticsTip}</p>
        </div>
      </div>
    </div>
  );
};
