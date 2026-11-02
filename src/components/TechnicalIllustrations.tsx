import React, { useState } from 'react';
import { DiagnosticFault, PinDefinition } from '../data/electricalData';
import { 
  Zap, 
  Info, 
  AlertTriangle, 
  Layers, 
  Eye, 
  Sliders, 
  Maximize2,
  CheckCircle2
} from 'lucide-react';

interface TechnicalIllustrationProps {
  nodeId: string;
  activeFault: DiagnosticFault | null;
  activePin: PinDefinition | null;
  onSelectPinByName?: (pinNumberOrName: string) => void;
}

export const TechnicalIllustration: React.FC<TechnicalIllustrationProps> = ({
  nodeId,
  activeFault,
  activePin,
  onSelectPinByName,
}) => {
  const [activeCallout, setActiveCallout] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cutaway' | 'schematic' | 'exploded'>('cutaway');

  const isCoils = nodeId === 'coils_pack';
  const isThrottle = nodeId === 'throttle_etcs';
  const isEcm = nodeId === 'ecm';
  const isAlternator = nodeId === 'alternator';
  const isFusebox = nodeId === 'fusebox';
  const isKnock = nodeId === 'knock_sensor';
  const isGround = nodeId === 'ground_ec' || nodeId === 'ground_eb';

  // Render Component-Specific Vector Technical Cutaway Illustration
  return (
    <div className="w-full bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden flex flex-col select-none">
      {/* Top Illustration Sub-Toolbar */}
      <div className="px-3 py-2 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80 font-bold">
            OEM FACTORY BLUEPRINT
          </span>
          <span className="text-neutral-400 text-[11px] font-mono hidden sm:inline">
            Engineering Cutaway & Section View
          </span>
        </div>

        {/* View Switcher: Cutaway vs Internal Architecture */}
        <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[10px] font-mono">
          <button
            onClick={() => setViewMode('cutaway')}
            className={`px-2 py-0.5 rounded transition ${
              viewMode === 'cutaway' ? 'bg-sky-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cutaway Section
          </button>
          <button
            onClick={() => setViewMode('schematic')}
            className={`px-2 py-0.5 rounded transition ${
              viewMode === 'schematic' ? 'bg-sky-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Internal Logic
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#040814] via-[#060b19] to-[#03060f] p-3 flex items-center justify-center overflow-hidden">
        {/* Subtle Engineering Grid Backdrop */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* 1. IGNITION COIL COP CUTAWAY ILLUSTRATION */}
        {isCoils && (
          <svg viewBox="0 0 640 460" className="w-full h-full font-mono text-xs z-10">
            <defs>
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="80%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="bootGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="coreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <pattern id="hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Title Block in Engineering Spec */}
            <text x="24" y="32" fill="#38bdf8" fontSize="12" fontWeight="bold">
              DENSO COP IGNITION COIL WITH EMBEDDED IGBT IGNITER
            </text>
            <text x="24" y="48" fill="#64748b" fontSize="9">
              Toyota M20A-FKS 2.0L · Section View A-A · 4-Pin Waterproof Socket
            </text>

            {/* Spark Ionization Flash Effect if coil active */}
            <circle cx="320" cy="425" r="14" fill="rgba(56, 189, 248, 0.15)" />
            <circle cx="320" cy="425" r="6" fill="#38bdf8" className="animate-ping" />

            {/* Spark Plug Cutaway at Bottom */}
            <g transform="translate(0, 0)">
              {/* Plug Hex Shell */}
              <rect x="290" y="350" width="60" height="40" rx="3" fill="url(#metalGrad)" stroke="#64748b" strokeWidth="1.2" />
              {/* Threaded Section */}
              <rect x="296" y="390" width="48" height="30" fill="#334155" stroke="#475569" strokeWidth="1" />
              {[-3, 3, 9, 15, 21].map((ty) => (
                <line key={ty} x1="294" y1={395 + ty} x2="346" y2={397 + ty} stroke="#94a3b8" strokeWidth="1.5" />
              ))}
              {/* Ground Electrode */}
              <path d="M 312 420 L 312 432 L 324 432" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
              {/* Center Electrode */}
              <rect x="318" y="415" width="4" height="12" fill="#f8fafc" />
              {/* Spark Arc */}
              {activeFault?.code !== 'P0301' && activeFault?.code !== 'P0350' && (
                <path d="M 320 427 L 318 430 L 322 432" stroke="#38bdf8" strokeWidth="2" fill="none" />
              )}
            </g>

            {/* High-Dielectric Silicone Rubber Boot */}
            <path
              d="M 285 240 L 280 340 L 300 350 L 340 350 L 360 340 L 355 240 Z"
              fill="url(#bootGrad)"
              stroke="#475569"
              strokeWidth="1.5"
            />
            {/* Boot Internal High-Voltage Conductor Spring */}
            <path
              d="M 320 240 L 314 255 L 326 270 L 314 285 L 326 300 L 314 315 L 326 330 L 320 345"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />

            {/* Upper Coil Body Housing (Phenolic Resin) */}
            <rect x="250" y="100" width="140" height="140" rx="8" fill="#111827" stroke="#334155" strokeWidth="1.5" />
            <rect x="254" y="104" width="132" height="132" fill="url(#hatch)" />

            {/* Laminated Silicon Steel Core (Center) */}
            <rect x="306" y="112" width="28" height="116" rx="3" fill="url(#coreGrad)" stroke="#475569" strokeWidth="1.2" />

            {/* Primary Copper Winding (Inner) */}
            <rect x="290" y="120" width="14" height="100" fill="url(#copperGrad)" stroke="#b45309" strokeWidth="1" />
            <rect x="336" y="120" width="14" height="100" fill="url(#copperGrad)" stroke="#b45309" strokeWidth="1" />

            {/* Secondary Copper Winding (Outer, high turn count) */}
            <rect x="264" y="116" width="22" height="108" fill="url(#copperGrad)" stroke="#b45309" strokeWidth="1" opacity="0.85" />
            <rect x="354" y="116" width="22" height="108" fill="url(#copperGrad)" stroke="#b45309" strokeWidth="1" opacity="0.85" />

            {/* Internal Solid-State IGBT Driver Transistor Module */}
            <rect x="268" y="72" width="104" height="26" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="320" y="89" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
              IGBT IGNITER CHIP
            </text>

            {/* 4-Pin Waterproof Connector Shell at Top */}
            <path
              d="M 270 72 L 270 28 L 370 28 L 370 72 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1.5"
            />
            {/* Locking Tab Clip */}
            <path d="M 305 28 L 305 16 L 335 16 L 335 28" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="320" cy="22" r="3" fill="#38bdf8" />

            {/* 4 Gold-Plated Terminal Pins */}
            {[0, 1, 2, 3].map((pIdx) => {
              const px = 286 + pIdx * 22;
              const pinLabels = ['1:+B', '2:IGF', '3:IGT', '4:GND'];
              const pinColors = ['#dc2626', '#f8fafc', '#38bdf8', '#10b981'];
              const isSelected = activePin?.pin.includes(`${pIdx + 1}`);

              return (
                <g 
                  key={pIdx} 
                  className="cursor-pointer" 
                  onClick={() => onSelectPinByName && onSelectPinByName(`Pin ${pIdx + 1}`)}
                >
                  <rect
                    x={px}
                    y="32"
                    width="12"
                    height="28"
                    rx="2"
                    fill={isSelected ? '#38bdf8' : '#eab308'}
                    stroke="#ca8a04"
                    strokeWidth="1"
                  />
                  <text x={px + 6} y="68" fill={pinColors[pIdx]} fontSize="8" fontWeight="bold" textAnchor="middle">
                    {pIdx + 1}
                  </text>
                </g>
              );
            })}

            {/* Technical Callout Leaders & Balloons */}
            {/* Callout 1: 4-Pin Socket */}
            <g className="cursor-pointer" onClick={() => setActiveCallout(1)}>
              <polyline points="370,45 440,45" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="440" cy="45" r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="440" y="48.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
              <text x="456" y="48" fill="#e2e8f0" fontSize="10" fontWeight="bold">Sumitomo 4-Pin Sealed Socket</text>
            </g>

            {/* Callout 2: IGBT Driver */}
            <g className="cursor-pointer" onClick={() => setActiveCallout(2)}>
              <polyline points="372,85 440,85" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="440" cy="85" r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="440" y="88.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
              <text x="456" y="88" fill="#e2e8f0" fontSize="10" fontWeight="bold">Silicon IGBT Driver Chip</text>
            </g>

            {/* Callout 3: Primary & Secondary Windings */}
            <g className="cursor-pointer" onClick={() => setActiveCallout(3)}>
              <polyline points="376,160 440,160" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="440" cy="160" r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="440" y="163.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
              <text x="456" y="163" fill="#e2e8f0" fontSize="10" fontWeight="bold">Primary (0.6Ω) / Secondary (13kΩ)</text>
            </g>

            {/* Callout 4: Laminated Core */}
            <g className="cursor-pointer" onClick={() => setActiveCallout(4)}>
              <polyline points="290,170 200,170" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="200" cy="170" r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="200" y="173.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">4</text>
              <text x="185" y="173" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="end">Silicon Steel Core</text>
            </g>

            {/* Callout 5: High-Voltage Spring */}
            <g className="cursor-pointer" onClick={() => setActiveCallout(5)}>
              <polyline points="326,290 440,290" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="440" cy="290" r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="440" y="293.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">5</text>
              <text x="456" y="293" fill="#e2e8f0" fontSize="10" fontWeight="bold">5kΩ Noise Suppressor Spring</text>
            </g>

            {/* Callout 6: Spark Plug Boot */}
            <g className="cursor-pointer" onClick={() => setActiveCallout(6)}>
              <polyline points="280,310 200,310" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="200" cy="310" r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="200" y="313.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">6</text>
              <text x="185" y="313" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="end">Silicone EPDM Boot</text>
            </g>

            {/* Visual Fault Warning in Diagram */}
            {activeFault?.code === 'P0301' && (
              <g className="animate-pulse">
                <rect x="420" y="10" width="200" height="40" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="430" y="27" fill="#fca5a5" fontSize="10" fontWeight="bold">FAULT: IGT1 PIN 3 OPEN</text>
                <text x="430" y="41" fill="#fecaca" fontSize="9">Zero primary trigger signal</text>
              </g>
            )}
          </svg>
        )}

        {/* 2. ELECTRONIC THROTTLE (ETCS-i) CUTAWAY ILLUSTRATION */}
        {isThrottle && (
          <svg viewBox="0 0 640 460" className="w-full h-full font-mono text-xs z-10">
            <defs>
              <radialGradient id="boreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </radialGradient>
              <linearGradient id="brassPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            <text x="24" y="32" fill="#f97316" fontSize="12" fontWeight="bold">
              DENSO ETCS-i ELECTRONIC THROTTLE BODY (DRIVE-BY-WIRE)
            </text>
            <text x="24" y="48" fill="#64748b" fontSize="9">
              DC Servo Drive Motor · Dual Non-Contact Hall TPS (VTA1/VTA2) · 6-Pin Connector
            </text>

            {/* Throttle Cast Aluminum Body Outer Profile */}
            <rect x="80" y="80" width="480" height="320" rx="16" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
            {/* 4 Mounting Bolt Holes */}
            {[
              [105, 105], [535, 105], [105, 375], [535, 375]
            ].map(([bx, by], idx) => (
              <circle key={idx} cx={bx} cy={by} r="12" fill="#09090b" stroke="#52525b" strokeWidth="1.5" />
            ))}

            {/* Central Throttle Air Bore (60mm circular opening) */}
            <circle cx="260" cy="240" r="110" fill="url(#boreGrad)" stroke="#52525b" strokeWidth="2.5" />

            {/* Throttle Shaft & Brass Butterfly Plate (Rotated ~12° at idle) */}
            <ellipse cx="260" cy="240" rx="108" ry="24" fill="url(#brassPlate)" stroke="#78350f" strokeWidth="1.5" transform="rotate(-15 260 240)" />
            {/* Center Shaft */}
            <line x1="150" y1="240" x2="370" y2="240" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <circle cx="235" cy="240" r="4" fill="#1e293b" />
            <circle cx="285" cy="240" r="4" fill="#1e293b" />

            {/* Right Gearbox & DC Motor Chamber */}
            <rect x="380" y="110" width="160" height="260" rx="10" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <text x="460" y="135" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle">
              ACTUATOR HOUSING
            </text>

            {/* DC Servo Motor (Cutaway) */}
            <rect x="400" y="150" width="120" height="70" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
            <rect x="415" y="162" width="90" height="46" fill="#334155" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" />
            <text x="460" y="190" fill="#fcd34d" fontSize="9" fontWeight="bold" textAnchor="middle">DC MOTOR (M+/M-)</text>

            {/* Reduction Gear Train */}
            <circle cx="430" cy="265" r="32" fill="#27272a" stroke="#71717a" strokeWidth="1.5" />
            <circle cx="485" cy="285" r="24" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
            {/* Torsion Return Spring (Limp-Home 7% Default) */}
            <circle cx="430" cy="265" r="16" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="4,3" />

            {/* Dual Hall Effect Sensor IC Board (TPS) */}
            <rect x="400" y="325" width="120" height="36" rx="4" fill="#042f2e" stroke="#14b8a6" strokeWidth="1.5" />
            <text x="460" y="342" fill="#2dd4bf" fontSize="9" fontWeight="bold" textAnchor="middle">
              DUAL HALL TPS (VTA1 / VTA2)
            </text>
            <text x="460" y="354" fill="#99f6e4" fontSize="8" textAnchor="middle">
              5V VCTA · Ground ETA
            </text>

            {/* 6-Pin Sealed Connector Socket (Bottom Right) */}
            <rect x="420" y="380" width="80" height="25" rx="3" fill="#18181b" stroke="#52525b" strokeWidth="1.5" />
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <circle key={idx} cx={432 + idx * 11} cy={392} r="3" fill="#eab308" />
            ))}

            {/* Callouts */}
            <g className="cursor-pointer" onClick={() => setActiveCallout(1)}>
              <polyline points="260,130 180,60" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="180" cy="60" r="9" fill="#c2410c" stroke="#f97316" strokeWidth="1.5" />
              <text x="180" y="63.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
              <text x="165" y="63" fill="#fed7aa" fontSize="10" fontWeight="bold" textAnchor="end">60mm Aluminum Throttle Bore</text>
            </g>

            <g className="cursor-pointer" onClick={() => setActiveCallout(2)}>
              <polyline points="320,240 220,330" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="220" cy="330" r="9" fill="#c2410c" stroke="#f97316" strokeWidth="1.5" />
              <text x="220" y="333.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
              <text x="205" y="333" fill="#fed7aa" fontSize="10" fontWeight="bold" textAnchor="end">Precision Butterfly Plate</text>
            </g>

            <g className="cursor-pointer" onClick={() => setActiveCallout(3)}>
              <polyline points="520,185 580,185" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="580" cy="185" r="9" fill="#c2410c" stroke="#f97316" strokeWidth="1.5" />
              <text x="580" y="188.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
              <text x="595" y="188" fill="#fed7aa" fontSize="10" fontWeight="bold">DC Servo Drive Motor</text>
            </g>

            <g className="cursor-pointer" onClick={() => setActiveCallout(4)}>
              <polyline points="520,345 580,345" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="580" cy="345" r="9" fill="#c2410c" stroke="#f97316" strokeWidth="1.5" />
              <text x="580" y="348.5" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">4</text>
              <text x="595" y="348" fill="#fed7aa" fontSize="10" fontWeight="bold">Non-Contact Hall ICs</text>
            </g>

            {/* Fault Banner if P0122 */}
            {activeFault?.code === 'P0122' && (
              <g className="animate-pulse">
                <rect x="20" y="415" width="280" height="36" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="30" y="430" fill="#fca5a5" fontSize="10" fontWeight="bold">FAULT: 5V VCTA LINE OPEN</text>
                <text x="30" y="443" fill="#fecaca" fontSize="9">TPS pegged at 0.08V (Limp Home 7%)</text>
              </g>
            )}
          </svg>
        )}

        {/* 3. ENGINE CONTROL MODULE (ECM / ECU) CUTAWAY ILLUSTRATION */}
        {isEcm && (
          <svg viewBox="0 0 640 460" className="w-full h-full font-mono text-xs z-10">
            <defs>
              <linearGradient id="pcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>

            <text x="24" y="32" fill="#22c55e" fontSize="12" fontWeight="bold">
              DENSO 32-BIT ENGINE CONTROL MODULE (ECM ARCHITECTURE)
            </text>
            <text x="24" y="48" fill="#64748b" fontSize="9">
              Die-Cast Aluminum Heat Sink Enclosure · Cam-Locking Lever Header A24 (60-Pin)
            </text>

            {/* Aluminum Outer Shell with Cooling Fins */}
            <rect x="60" y="70" width="520" height="340" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            {/* Heat Fins along Left and Right edges */}
            {[0, 1, 2, 3, 4, 5, 6].map((fi) => (
              <rect key={fi} x="48" y={110 + fi * 35} width="12" height="20" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
            ))}

            {/* Cutaway Internal Multi-Layer PCB Motherboard */}
            <rect x="180" y="90" width="380" height="300" rx="8" fill="url(#pcbGrad)" stroke="#10b981" strokeWidth="1.5" />

            {/* High-Performance 32-Bit Dual-Core MCU Chip */}
            <rect x="280" y="140" width="110" height="110" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="335" y="190" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
              RENESAS MCU
            </text>
            <text x="335" y="206" fill="#94a3b8" fontSize="9" textAnchor="middle">
              32-BIT DUAL-CORE
            </text>
            <text x="335" y="222" fill="#64748b" fontSize="8" textAnchor="middle">
              Direct Injection / VVT-i
            </text>

            {/* Power MOSFET Drivers for Coils & Injectors (Heatsink Bar) */}
            <rect x="430" y="130" width="100" height="220" rx="4" fill="#111827" stroke="#eab308" strokeWidth="1.5" />
            <text x="480" y="152" fill="#eab308" fontSize="10" fontWeight="bold" textAnchor="middle">
              POWER STAGE
            </text>
            {[0, 1, 2, 3].map((mi) => (
              <g key={mi}>
                <rect x="445" y={170 + mi * 42} width="70" height="30" rx="3" fill="#1e293b" stroke="#ca8a04" strokeWidth="1" />
                <text x="480" y={188 + mi * 42} fill="#fef08a" fontSize="8" textAnchor="middle">
                  IGBT CH {mi + 1}
                </text>
              </g>
            ))}

            {/* Dual Sealed Headers on Left (A24 60-Pin & A25 58-Pin) */}
            <rect x="80" y="100" width="90" height="130" rx="6" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
            <text x="125" y="120" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">A24 (60P)</text>
            {/* White Cam-Locking Lever */}
            <rect x="68" y="130" width="16" height="70" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="76" cy="165" r="4" fill="#38bdf8" />

            <rect x="80" y="250" width="90" height="130" rx="6" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
            <text x="125" y="270" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle">A25 (58P)</text>
            <rect x="68" y="280" width="16" height="70" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Trace Buses across Board */}
            <path d="M 170 145 L 280 160" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" fill="none" />
            <path d="M 170 175 L 280 185" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" fill="none" />
            <path d="M 390 195 L 430 195" stroke="#eab308" strokeWidth="2.5" fill="none" />
            <path d="M 390 235 L 430 235" stroke="#eab308" strokeWidth="2.5" fill="none" />
          </svg>
        )}

        {/* 4. SMART ALTERNATOR 140A CUTAWAY ILLUSTRATION */}
        {isAlternator && (
          <svg viewBox="0 0 640 460" className="w-full h-full font-mono text-xs z-10">
            <defs>
              <linearGradient id="statorCopper" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>

            <text x="24" y="32" fill="#38bdf8" fontSize="12" fontWeight="bold">
              DENSO 140A SC (SEGMENT CONDUCTOR) SMART ALTERNATOR
            </text>
            <text x="24" y="48" fill="#64748b" fontSize="9">
              Hairpin Stator Windings · Internal LIN Bus Regulator · 12-Diode High Efficiency Bridge
            </text>

            {/* Outer Cast Aluminum Alternator Housing */}
            <circle cx="320" cy="250" r="150" fill="#18181b" stroke="#475569" strokeWidth="2" />
            {/* Ventilation Slots along Perimeter */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <rect
                key={deg}
                x="312"
                y="110"
                width="16"
                height="32"
                rx="4"
                fill="#090d16"
                stroke="#334155"
                transform={`rotate(${deg} 320 250)`}
              />
            ))}

            {/* Segment Conductor (SC) Stator Hairpin Windings (Square copper wire ring) */}
            <circle cx="320" cy="250" r="118" fill="none" stroke="url(#statorCopper)" strokeWidth="28" strokeDasharray="8,4" />

            {/* Rotor Claw-Pole Assembly in Center */}
            <circle cx="320" cy="250" r="85" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <circle cx="320" cy="250" r="45" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Smart Monolithic LIN Regulator Module & Brush Holder */}
            <rect x="270" y="200" width="100" height="60" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="320" y="225" fill="#c7d2fe" fontSize="10" fontWeight="bold" textAnchor="middle">
              SMART LIN REGULATOR
            </text>
            <text x="320" y="242" fill="#a5b4fc" fontSize="8" textAnchor="middle">
              19.2 kbaud Bidirectional
            </text>

            {/* High-Current M8 B+ Copper Stud Output */}
            <rect x="430" y="100" width="60" height="40" rx="4" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="460" cy="120" r="12" fill="#f59e0b" stroke="#ca8a04" strokeWidth="2" />
            <text x="460" y="124" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">B+</text>
            <text x="460" y="88" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">14.2V 140A Output</text>
          </svg>
        )}

        {/* 5. ENGINE JUNCTION BLOCK NO. 1 CUTAWAY ILLUSTRATION */}
        {isFusebox && (
          <svg viewBox="0 0 640 460" className="w-full h-full font-mono text-xs z-10">
            <text x="24" y="32" fill="#eab308" fontSize="12" fontWeight="bold">
              ENGINE JUNCTION BLOCK NO. 1 (FUSE & RELAY CENTER)
            </text>
            <text x="24" y="48" fill="#64748b" fontSize="9">
              Fusible Link Bus Bar · Micro ISO Denso Relays · Mini Blade Fuses
            </text>

            {/* Heavy-Duty Molded Enclosure Tray */}
            <rect x="50" y="70" width="540" height="340" rx="14" fill="#18181b" stroke="#334155" strokeWidth="2" />

            {/* Main Battery High-Current Fusible Link Bar */}
            <rect x="80" y="100" width="480" height="65" rx="8" fill="#090d16" stroke="#b45309" strokeWidth="1.5" />
            <text x="95" y="120" fill="#f59e0b" fontSize="10" fontWeight="bold">
              MAIN BATTERY DISTRIBUTION LINK BUS (B+ HIGH CURRENT)
            </text>

            {/* Fuse Link Cartridges */}
            {[
              { name: 'ALT', amp: '140A', x: 95, color: '#eab308' },
              { name: 'EPS', amp: '80A', x: 215, color: '#ef4444' },
              { name: 'ABS', amp: '50A', x: 335, color: '#ef4444' },
              { name: 'FAN', amp: '30A', x: 455, color: '#06b6d4' },
            ].map((fc) => (
              <g key={fc.name}>
                <rect x={fc.x} y="126" width="105" height="30" rx="4" fill="#1e293b" stroke={fc.color} strokeWidth="1.5" />
                <text x={fc.x + 8} y="146" fill="#fff" fontSize="10" fontWeight="bold">{fc.name}</text>
                <text x={fc.x + 95} y="146" fill={fc.color} fontSize="11" fontWeight="bold" textAnchor="end">{fc.amp}</text>
              </g>
            ))}

            {/* Array of Micro ISO Relays (Denso Cyan Housings) */}
            <text x="80" y="195" fill="#a1a1aa" fontSize="10" fontWeight="bold">
              MICRO-ISO RELAY BANK
            </text>
            {[
              { name: 'EFI MAIN', x: 80, y: 210 },
              { name: 'STARTER', x: 190, y: 210 },
              { name: 'FAN NO.1', x: 300, y: 210 },
              { name: 'H-LP LH', x: 410, y: 210 },
            ].map((rel) => (
              <g key={rel.name}>
                <rect x={rel.x} y={rel.y} width="95" height="75" rx="6" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                <text x={rel.x + 47} y={rel.y + 35} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {rel.name}
                </text>
                <text x={rel.x + 47} y={rel.y + 52} fill="#bae6fd" fontSize="8" textAnchor="middle">
                  4-PIN ISO 12V
                </text>
              </g>
            ))}

            {/* Mini Blade Fuse Rack */}
            <text x="80" y="315" fill="#a1a1aa" fontSize="10" fontWeight="bold">
              MINI BLADE FUSE MATRIX
            </text>
            {[
              { name: 'EFI-1', amp: '25A', col: '#f59e0b', x: 80 },
              { name: 'IGN', amp: '10A', col: '#ef4444', x: 145 },
              { name: 'ETCS', amp: '10A', col: '#ef4444', x: 210 },
              { name: 'ECU-B', amp: '10A', col: '#ef4444', x: 275 },
              { name: 'KAM-4', amp: '10A', col: '#ef4444', x: 340 },
              { name: 'INJ', amp: '15A', col: '#3b82f6', x: 405 },
            ].map((mf) => {
              const isBlown = (activeFault?.code === 'P0685' && mf.name === 'EFI-1') ||
                              (activeFault?.code === 'P0350' && mf.name === 'IGN');
              return (
                <g key={mf.name}>
                  <rect
                    x={mf.x}
                    y="330"
                    width="55"
                    height="60"
                    rx="4"
                    fill={isBlown ? '#450a0a' : '#1e293b'}
                    stroke={isBlown ? '#ef4444' : mf.col}
                    strokeWidth={isBlown ? 2.5 : 1.2}
                    className={isBlown ? 'animate-pulse' : ''}
                  />
                  <text x={mf.x + 27} y="352" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {mf.name}
                  </text>
                  <text x={mf.x + 27} y="372" fill={mf.col} fontSize="11" fontWeight="bold" textAnchor="middle">
                    {mf.amp}
                  </text>
                  {isBlown && (
                    <text x={mf.x + 27} y="384" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">
                      BLOWN
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* 6. KNOCK SENSOR & GROUND EYELET */}
        {(isKnock || isGround) && (
          <svg viewBox="0 0 640 460" className="w-full h-full font-mono text-xs z-10">
            <defs>
              <linearGradient id="brassLug" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>

            <text x="24" y="32" fill="#10b981" fontSize="12" fontWeight="bold">
              ENGINE GROUND STUD EC & COAXIAL PIEZO KNOCK SENSOR
            </text>
            <text x="24" y="48" fill="#64748b" fontSize="9">
              M8 Cylinder Head Fastener · Double-Lug Ring Terminal · Braided EMI Shield
            </text>

            {/* Aluminum Cylinder Head Boss */}
            <rect x="100" y="120" width="220" height="240" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <text x="210" y="150" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
              CYLINDER HEAD CASTING
            </text>

            {/* M8 Steel Stud with Thread */}
            <rect x="180" y="200" width="60" height="120" rx="4" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Hex Nut */}
            <polygon points="170,230 250,230 260,250 250,270 170,270 160,250" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />

            {/* Heavy Brass Eyelet Lug Terminals */}
            <circle cx="210" cy="250" r="38" fill="url(#brassLug)" stroke="#78350f" strokeWidth="2" />
            <circle cx="210" cy="250" r="18" fill="#334155" />

            {/* Heavy W-B Ground Cable exiting Lug */}
            <path d="M 210 288 L 210 390 L 380 390" fill="none" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
            <path d="M 210 288 L 210 390 L 380 390" fill="none" stroke="#111827" strokeWidth="4" strokeDasharray="8,6" />
            <text x="395" y="394" fill="#fff" fontSize="11" fontWeight="bold">W-B Main Ground Cable to Coils & ECM</text>

            {/* Coaxial Shield Drain Wire */}
            <path d="M 235 275 L 350 275 L 420 200" fill="none" stroke="#94a3b8" strokeWidth="4" />
            <text x="360" y="265" fill="#38bdf8" fontSize="10">Coaxial Braided Shield Foil</text>

            {/* Piezo Knock Sensor Assembly on Right */}
            <circle cx="480" cy="180" r="55" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="480" cy="180" r="28" fill="#090d16" stroke="#0ea5e9" strokeWidth="1.5" />
            <circle cx="480" cy="180" r="14" fill="#f59e0b" />
            <text x="480" y="140" fill="#e0f2fe" fontSize="10" fontWeight="bold" textAnchor="middle">
              KNOCK SENSOR K1
            </text>
            <text x="480" y="250" fill="#7dd3fc" fontSize="9" textAnchor="middle">
              Piezoceramic Ring Element
            </text>
          </svg>
        )}
      </div>

      {/* Interactive Anatomy / Component Callout Legend Footer */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-[11px] text-neutral-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            {isCoils && 'Section shows dual copper windings & solid-state IGBT module.'}
            {isThrottle && 'Shows compound reduction gears, return spring & dual Hall-effect TPS.'}
            {isEcm && 'Shows Renesas 32-bit MCU, power MOSFET array & cam-locking lever header.'}
            {isAlternator && 'Shows hairpin copper stator, LIN regulator & M8 high-output B+ stud.'}
            {isFusebox && 'Shows 140A ALT fusible link bar, micro ISO relays & mini blade fuses.'}
            {(isKnock || isGround) && 'Shows M8 Cylinder Head Ground Stud EC and coaxial shield drain.'}
          </span>
        </div>
        <span className="text-neutral-500 font-mono text-[10px]">OEM ISO 6722-1</span>
      </div>
    </div>
  );
};
