import React, { useState } from 'react';
import { DiagnosticFault, DIAGNOSTIC_FAULTS, SubsystemCategory } from '../data/electricalData';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Flame, 
  Activity, 
  Sliders, 
  RotateCcw, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface FaultSimulatorProps {
  activeFault: DiagnosticFault | null;
  onSelectFault: (fault: DiagnosticFault | null) => void;
  customResistance: number;
  onCustomResistanceChange: (val: number) => void;
  onFocusFaultIn3D: (nodeId: string) => void;
}

export const FaultSimulator: React.FC<FaultSimulatorProps> = ({
  activeFault,
  onSelectFault,
  customResistance,
  onCustomResistanceChange,
  onFocusFaultIn3D,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showGuidedSteps, setShowGuidedSteps] = useState(true);

  // Filter fault scenarios
  const filteredFaults = DIAGNOSTIC_FAULTS.filter((f) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'short') return f.faultType === 'short_ground';
    if (activeCategory === 'open') return f.faultType === 'open_circuit';
    if (activeCategory === 'drop') return f.faultType === 'high_resistance';
    return true;
  });

  // Calculate simulated live ground voltage drop based on custom resistance
  // Assuming 1.2A coil/sensor ground current
  const calculatedDrop = (1.2 * customResistance).toFixed(2);

  return (
    <div className="flex flex-col h-full text-xs select-none bg-neutral-900 border-l border-neutral-800">
      {/* Header */}
      <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded font-bold">
              FAULT INJECTION
            </span>
            <span className="text-neutral-400 text-[11px]">Real-Time Simulator</span>
          </div>
          <h2 className="text-sm font-bold text-white mt-1">Electrical Malfunction Engine</h2>
        </div>

        {activeFault ? (
          <button
            onClick={() => onSelectFault(null)}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
            title="Restore circuit integrity & clear fault"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Repair System</span>
          </button>
        ) : (
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All Circuits Nominal</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Active Fault Banner (if active) */}
        {activeFault ? (
          <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-mono font-bold text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{activeFault.code}: {activeFault.title}</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700/60 uppercase">
                {activeFault.faultType.replace('_', ' ')}
              </span>
            </div>

            <p className="text-neutral-300 text-xs leading-relaxed">
              <strong className="text-red-300">Symptom:</strong> {activeFault.symptom}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 bg-neutral-950/80 rounded-lg border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">Anomalous Output:</div>
                <div className="text-amber-400 font-bold">{activeFault.anomalousVoltage}</div>
              </div>
              <div className="p-2 bg-neutral-950/80 rounded-lg border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">Scope Behavior:</div>
                <div className="text-sky-400 truncate font-semibold" title={activeFault.scopeBehavior}>
                  {activeFault.scopeBehavior.split(';')[0]}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onFocusFaultIn3D(activeFault.affectedNodeId)}
                className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 transition flex items-center justify-center gap-1.5"
              >
                <span>🎯</span> Focus in 3D Viewport
              </button>
              <button
                onClick={() => onSelectFault(null)}
                className="py-1.5 px-3 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          /* Live OBD-II Scan Tool Telemetry HUD */
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
              <span>OBD-II Real-Time Stream</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span>MIL: OFF</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
              <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                <div className="text-[10px] text-neutral-500">Engine RPM</div>
                <div className="text-xs font-bold text-sky-400 tabular-nums">748 RPM</div>
              </div>
              <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                <div className="text-[10px] text-neutral-500">System VDC</div>
                <div className="text-xs font-bold text-amber-400 tabular-nums">14.18 V</div>
              </div>
              <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                <div className="text-[10px] text-neutral-500">Throttle Angle</div>
                <div className="text-xs font-bold text-emerald-400 tabular-nums">12.4%</div>
              </div>
            </div>
          </div>
        )}

        {/* Fault Type Filter Segmented Control */}
        <div>
          <div className="text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Trigger Common Fault Scenarios
          </div>
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 mb-2.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-1 py-1 text-center font-medium rounded transition ${
                activeCategory === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All (7)
            </button>
            <button
              onClick={() => setActiveCategory('open')}
              className={`flex-1 py-1 text-center font-medium rounded transition ${
                activeCategory === 'open' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Open Circuit
            </button>
            <button
              onClick={() => setActiveCategory('short')}
              className={`flex-1 py-1 text-center font-medium rounded transition ${
                activeCategory === 'short' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Short Circuit
            </button>
            <button
              onClick={() => setActiveCategory('drop')}
              className={`flex-1 py-1 text-center font-medium rounded transition ${
                activeCategory === 'drop' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Voltage Drop
            </button>
          </div>

          {/* Fault Scenario Cards List */}
          <div className="space-y-2">
            {filteredFaults.map((fault) => {
              const isSelected = activeFault?.code === fault.code;
              return (
                <div
                  key={fault.code}
                  onClick={() => onSelectFault(isSelected ? null : fault)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/80 border-red-500 shadow-md shadow-red-950/50'
                      : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-400">{fault.code}</span>
                      <span className="font-semibold text-white">{fault.title.split('(')[0]}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                        fault.faultType === 'short_ground'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : fault.faultType === 'high_resistance'
                          ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                          : 'bg-red-950/60 border-red-800 text-red-300'
                      }`}
                    >
                      {fault.faultType.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{fault.symptom}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-900 text-[10px] text-neutral-500 font-mono">
                    <span>Terminal: {fault.affectedPin}</span>
                    <span className={isSelected ? 'text-red-400 font-bold' : 'text-sky-500'}>
                      {isSelected ? 'ACTIVE IN 3D' : 'Click to Inject'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Ground Voltage Drop & Resistance Dial */}
        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Ground Stud EC Oxidation Simulator</span>
            </div>
            <span className="font-mono text-purple-300 font-bold">{customResistance.toFixed(2)} Ω</span>
          </div>

          <p className="text-[11px] text-neutral-400">
            Simulate progressive corrosion or loose eyelet on Cylinder Head Ground Stud EC to test induced ground bounce.
          </p>

          <input
            type="range"
            min="0.02"
            max="6.0"
            step="0.05"
            value={customResistance}
            onChange={(e) => onCustomResistanceChange(parseFloat(e.target.value))}
            className="w-full accent-purple-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between font-mono text-[11px] pt-1">
            <span className="text-neutral-500">Induced Ground Drop:</span>
            <span
              className={`font-bold ${
                parseFloat(calculatedDrop) > 0.5 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              +{calculatedDrop} VDC Offset
            </span>
          </div>
        </div>

        {/* Guided Troubleshooting Procedures Tree */}
        {activeFault && (
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-sky-400" />
                <span>OEM Guided Test Steps</span>
              </span>
              <button
                onClick={() => setShowGuidedSteps(!showGuidedSteps)}
                className="text-[10px] text-sky-400 hover:underline font-mono"
              >
                {showGuidedSteps ? 'Hide' : 'Show'}
              </button>
            </div>

            {showGuidedSteps && (
              <div className="space-y-1.5 pt-1">
                {activeFault.steps.map((step, idx) => (
                  <div key={idx} className="p-2 bg-neutral-900 rounded-lg border border-neutral-800 text-[11px] text-neutral-300 leading-snug">
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulator Footer */}
      <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
        <span>Physics: Live 3D Charge Modulation</span>
        <span>ISO 6722-1</span>
      </div>
    </div>
  );
};
