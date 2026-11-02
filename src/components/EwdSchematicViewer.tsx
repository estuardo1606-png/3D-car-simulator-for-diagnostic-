import React, { useState } from 'react';
import { DiagnosticFault, HARNESS_NODES } from '../data/electricalData';
import { 
  FileText, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertTriangle,
  Download,
  Info
} from 'lucide-react';

interface EwdSchematicViewerProps {
  onClose: () => void;
  activeFault: DiagnosticFault | null;
  onSelectNode: (nodeId: string) => void;
}

export const EwdSchematicViewer: React.FC<EwdSchematicViewerProps> = ({
  onClose,
  activeFault,
  onSelectNode,
}) => {
  const [selectedSheet, setSelectedSheet] = useState<'ignition' | 'etcs' | 'power' | 'grounds'>('ignition');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [highlightedNet, setHighlightedNet] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 bg-neutral-950/98 backdrop-blur-md z-30 flex flex-col p-3 md:p-6 select-none overflow-hidden animate-in fade-in">
      {/* Header Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 uppercase font-bold">
              TOYOTA OEM EWD SCHEMATIC SYSTEM
            </span>
            <span className="text-neutral-400 text-xs hidden sm:inline">Corolla 2021 SE · 2.0L M20A-FKS · ISO 6722-1</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Electrical Wiring Schematics & Internal Circuit Logic</span>
          </h2>
        </div>

        {/* Controls: Sheet Selector & Zoom */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value as any)}
            className="bg-neutral-950 border border-neutral-700 text-xs rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-sky-500 font-semibold"
          >
            <option value="ignition">1. Direct Ignition COP System (IGT 1-4, IGF, Coils C1-C4)</option>
            <option value="etcs">2. ETCS-i Electronic Throttle H-Bridge & Dual Hall TPS</option>
            <option value="power">3. Power Distribution, ALT 140A Fusible Link & Relays</option>
            <option value="grounds">4. Ground Networks (EB, EC) & Braided Coaxial Shield</option>
          </select>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 text-neutral-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-neutral-300 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
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

      {/* Vector Schematic SVG Canvas */}
      <div className="flex-1 bg-[#030712] border-x border-b border-neutral-800 rounded-b-2xl overflow-auto p-4 flex items-center justify-center relative">
        {/* Schematic Grid Lines */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 w-full max-w-5xl"
        >
          {/* SHEET 1: IGNITION SYSTEM COP */}
          {selectedSheet === 'ignition' && (
            <svg viewBox="0 0 960 480" className="w-full h-auto font-mono text-xs bg-neutral-950 rounded-xl border border-neutral-800 shadow-2xl">
              <defs>
                <marker id="ewdArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Title Header */}
              <text x="24" y="32" fill="#38bdf8" fontSize="13" fontWeight="bold">
                EWD: DIRECT IGNITION SYSTEM COP (M20A-FKS DYNAMIC FORCE 2.0L)
              </text>
              <text x="24" y="48" fill="#64748b" fontSize="10">
                IGN 10A Fuse Feed · Internal IGBT Igniters · Common IGF Feedback Bus · Firing Order 1-3-4-2
              </text>

              {/* +12V Switched Power Rail at Top from Fuse Box */}
              <line x1="60" y1="85" x2="680" y2="85" stroke="#dc2626" strokeWidth="3" />
              <rect x="60" y="70" width="140" height="30" rx="4" fill="#1e293b" stroke="#dc2626" strokeWidth="1.5" />
              <text x="70" y="88" fill="#fca5a5" fontSize="10" fontWeight="bold">IGN 10A FUSE (+12V)</text>

              {/* ECM Unit Header on Right */}
              <rect x="720" y="60" width="210" height="380" rx="10" fill="#064e3b" stroke="#22c55e" strokeWidth="2" />
              <text x="825" y="90" fill="#22c55e" fontWeight="bold" textAnchor="middle" fontSize="13">
                ECM (HEADER A24)
              </text>
              <text x="825" y="106" fill="#86efac" fontSize="9" textAnchor="middle">
                Engine Microcomputer
              </text>

              {/* ECM Internal Trigger Driver Blocks */}
              {[
                { pin: '24A', name: 'IGT1 (Cyl 1)', y: 150, col: '#ef4444' },
                { pin: '25A', name: 'IGT2 (Cyl 2)', y: 200, col: '#eab308' },
                { pin: '26A', name: 'IGT3 (Cyl 3)', y: 250, col: '#3b82f6' },
                { pin: '27A', name: 'IGT4 (Cyl 4)', y: 300, col: '#10b981' },
                { pin: '28A', name: 'IGF (Feedback)', y: 350, col: '#f8fafc' },
              ].map((p) => (
                <g key={p.pin}>
                  <rect x="735" y={p.y - 14} width="180" height="28" rx="4" fill="#0f172a" stroke={p.col} strokeWidth="1.2" />
                  <text x="745" y={p.y + 4} fill={p.col} fontSize="10" fontWeight="bold">{p.pin}</text>
                  <text x="815" y={p.y + 4} fill="#e2e8f0" fontSize="9">{p.name}</text>
                </g>
              ))}

              {/* 4 COP Coil Schematic Blocks */}
              {[0, 1, 2, 3].map((i) => {
                const cx = 55 + i * 155;
                const num = i + 1;
                const igtColors = ['#ef4444', '#eab308', '#3b82f6', '#10b981'];
                const isCyl1Fault = activeFault?.code === 'P0301' && i === 0;

                return (
                  <g key={i} className="cursor-pointer" onClick={() => onSelectNode('coils_pack')}>
                    {/* Outer Housing Box */}
                    <rect
                      x={cx}
                      y="120"
                      width="135"
                      height="260"
                      rx="8"
                      fill="#0f172a"
                      stroke={isCyl1Fault ? '#ef4444' : '#334155'}
                      strokeWidth={isCyl1Fault ? 2.5 : 1.5}
                      className={isCyl1Fault ? 'animate-pulse' : ''}
                    />
                    <text x={cx + 67} y="142" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                      COIL {num} (C{num})
                    </text>

                    {/* Pin 1: +B Feed from Top Rail */}
                    <line x1={cx + 25} y1="85" x2={cx + 25} y2="155" stroke="#dc2626" strokeWidth="2" />
                    <circle cx={cx + 25} cy="85" r="3" fill="#dc2626" />
                    <text x={cx + 30} y="162" fill="#fca5a5" fontSize="8">Pin 1 (+B)</text>

                    {/* Internal Transformer Coils (Primary & Secondary) */}
                    {/* Primary Coil */}
                    <path
                      d={`M ${cx + 25} 170 Q ${cx + 15} 185 ${cx + 25} 195 Q ${cx + 15} 210 ${cx + 25} 220`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />
                    <text x={cx + 32} y="195" fill="#f59e0b" fontSize="8">PRI</text>

                    {/* Iron Core Bar */}
                    <line x1={cx + 38} y1="170" x2={cx + 38} y2="225" stroke="#64748b" strokeWidth="3" />

                    {/* Secondary Coil (High Turn count) */}
                    <path
                      d={`M ${cx + 50} 170 Q ${cx + 60} 180 ${cx + 50} 190 Q ${cx + 60} 200 ${cx + 50} 210 Q ${cx + 60} 220 ${cx + 50} 230`}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text x={cx + 65} y="195" fill="#38bdf8" fontSize="8">SEC</text>

                    {/* Spark Gap Symbol */}
                    <line x1={cx + 50} y1="230" x2={cx + 50} y2="248" stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1={cx + 44} y1="248" x2={cx + 56} y2="248" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1={cx + 46} y1="254" x2={cx + 54} y2="254" stroke="#cbd5e1" strokeWidth="2" />
                    <text x={cx + 62} y="253" fill="#94a3b8" fontSize="7">GAP</text>

                    {/* Internal IGBT Driver Transistor Symbol */}
                    <rect x={cx + 15} y="270" width="50" height="35" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                    <text x={cx + 40} y="290" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">IGBT</text>

                    {/* Pin 3: IGT Control Lead */}
                    <line x1={cx + 15} y1="288" x2={cx - 10} y2="288" stroke={igtColors[i]} strokeWidth="2" />
                    <text x={cx + 10} y="325" fill={igtColors[i]} fontSize="8" fontWeight="bold">Pin 3 (IGT)</text>

                    {/* Pin 4: Ground Lead to Head Stud EC */}
                    <line x1={cx + 40} y1="305" x2={cx + 40} y2="380" stroke="#94a3b8" strokeWidth="2.5" />
                    <text x={cx + 45} y="375" fill="#94a3b8" fontSize="8">Pin 4 (GND)</text>

                    {/* IGT Wire trace to ECM Header */}
                    <path
                      d={`M ${cx - 10} 288 L ${cx - 10} ${150 + i * 50} L 735 ${150 + i * 50}`}
                      fill="none"
                      stroke={isCyl1Fault ? '#ef4444' : igtColors[i]}
                      strokeWidth={isCyl1Fault ? 3.5 : 2}
                      strokeDasharray={isCyl1Fault ? '6,3' : 'none'}
                      markerEnd="url(#ewdArrow)"
                    />
                  </g>
                );
              })}

              {/* Common IGF Spark Confirmation Bus */}
              <line x1="120" y1="340" x2="680" y2="340" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="5,3" />
              <line x1="680" y1="340" x2="735" y2="350" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="5,3" markerEnd="url(#ewdArrow)" />
              <text x="350" y="333" fill="#f8fafc" fontSize="10" fontWeight="bold">
                Common IGF Feedback Return Bus (B-W Wire)
              </text>

              {/* Common Engine Ground EC Busbar at Bottom */}
              <line x1="50" y1="420" x2="680" y2="420" stroke="#94a3b8" strokeWidth="4" />
              <circle cx="700" cy="420" r="10" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
              <text x="700" y="424" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">EC</text>
              <text x="720" y="424" fill="#94a3b8" fontSize="10">Ground Stud EC (Cylinder Head M8)</text>

              {/* Fault Notification Callout in Diagram if P0301 */}
              {activeFault?.code === 'P0301' && (
                <g className="animate-pulse">
                  <rect x="240" y="100" width="220" height="42" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                  <text x="250" y="118" fill="#fca5a5" fontSize="11" fontWeight="bold">
                    FAULT P0301: IGT1 OPEN
                  </text>
                  <text x="250" y="132" fill="#fecaca" fontSize="9">
                    Red wire severed between ECM 24A & Coil 1
                  </text>
                </g>
              )}
            </svg>
          )}

          {/* SHEET 2: ETCS-i THROTTLE SCHEMATIC */}
          {selectedSheet === 'etcs' && (
            <svg viewBox="0 0 960 440" className="w-full h-auto font-mono text-xs bg-neutral-950 rounded-xl border border-neutral-800 shadow-2xl">
              <text x="24" y="32" fill="#f97316" fontSize="13" fontWeight="bold">
                EWD: ETCS-i ELECTRONIC THROTTLE ACTUATOR & DUAL HALL TPS
              </text>
              <text x="24" y="48" fill="#64748b" fontSize="10">
                H-Bridge Bi-Directional PWM Motor Drive · Complementary TPS Channels VTA1 / VTA2
              </text>

              {/* Throttle Connector T1 Body on Left */}
              <rect x="60" y="80" width="300" height="320" rx="12" fill="#18181b" stroke="#f97316" strokeWidth="2" />
              <text x="210" y="110" fill="#f97316" fontSize="12" fontWeight="bold" textAnchor="middle">
                ETCS-i MOTOR & SENSOR (CONNECTOR T1)
              </text>

              {/* DC Motor Symbol with H-Bridge Terminals */}
              <circle cx="150" cy="180" r="40" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              <text x="150" y="185" fill="#f59e0b" fontSize="14" fontWeight="bold" textAnchor="middle">M</text>
              <text x="150" y="235" fill="#e2e8f0" fontSize="9" textAnchor="middle">DC Servo Actuator</text>

              <line x1="190" y1="165" x2="360" y2="165" stroke="#16a34a" strokeWidth="2.5" />
              <text x="240" y="158" fill="#16a34a" fontSize="9">Pin 1: M+ (Green)</text>

              <line x1="190" y1="195" x2="360" y2="195" stroke="#dc2626" strokeWidth="2.5" />
              <text x="240" y="210" fill="#dc2626" fontSize="9">Pin 2: M- (Red)</text>

              {/* Dual Hall Effect Sensor TPS Circuit on Lower Half */}
              <rect x="80" y="260" width="260" height="120" rx="6" fill="#042f2e" stroke="#14b8a6" strokeWidth="1.5" />
              <text x="210" y="280" fill="#2dd4bf" fontSize="10" fontWeight="bold" textAnchor="middle">
                DUAL NON-CONTACT HALL TPS
              </text>

              <line x1="340" y1="300" x2="680" y2="300" stroke="#2563eb" strokeWidth="2" />
              <text x="360" y="294" fill="#60a5fa" fontSize="9">Pin 3: VCTA (+5.00V Reference)</text>

              <line x1="340" y1="325" x2="680" y2="325" stroke="#78350f" strokeWidth="2" />
              <text x="360" y="320" fill="#d97706" fontSize="9">Pin 4: ETA (Sensor Ground Return)</text>

              <line x1="340" y1="350" x2="680" y2="350" stroke="#f8fafc" strokeWidth="2" />
              <text x="360" y="344" fill="#f8fafc" fontSize="9">Pin 5: VTA1 (Main TPS Output 0.6V-4.4V)</text>

              <line x1="340" y1="375" x2="680" y2="375" stroke="#eab308" strokeWidth="2" />
              <text x="360" y="369" fill="#fde047" fontSize="9">Pin 6: VTA2 (Sub TPS Output 2.2V-4.8V)</text>

              {/* ECM Unit Header on Right */}
              <rect x="680" y="80" width="220" height="320" rx="12" fill="#064e3b" stroke="#22c55e" strokeWidth="2" />
              <text x="790" y="110" fill="#22c55e" fontSize="13" fontWeight="bold" textAnchor="middle">
                ECM (HEADER A24)
              </text>
              <text x="790" y="130" fill="#86efac" fontSize="9" textAnchor="middle">
                Drive-By-Wire H-Bridge Logic
              </text>
            </svg>
          )}

          {/* SHEET 3: POWER & CHARGING */}
          {selectedSheet === 'power' && (
            <svg viewBox="0 0 960 420" className="w-full h-auto font-mono text-xs bg-neutral-950 rounded-xl border border-neutral-800 shadow-2xl">
              <text x="24" y="32" fill="#eab308" fontSize="13" fontWeight="bold">
                EWD: CHARGING SYSTEM & FUSIBLE LINK DISTRIBUTION
              </text>
              <text x="24" y="48" fill="#64748b" fontSize="10">
                140A Main Fusible Link · Segment Conductor Alternator · LIN Bus Regulator
              </text>

              {/* 12V Battery Block */}
              <rect x="60" y="130" width="140" height="110" rx="8" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
              <text x="130" y="165" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">12V BATTERY</text>
              <circle cx="100" cy="195" r="8" fill="#dc2626" />
              <text x="100" y="199" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">+</text>
              <circle cx="160" cy="195" r="8" fill="#475569" />
              <text x="160" y="199" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">-</text>

              {/* ALT 140A Fusible Link */}
              <path d="M 200 180 L 300 180" stroke="#f8fafc" strokeWidth="6" />
              <rect x="300" y="135" width="180" height="90" rx="8" fill="#0f172a" stroke="#eab308" strokeWidth="2" />
              <text x="390" y="165" fill="#eab308" fontSize="11" fontWeight="bold" textAnchor="middle">ALT FUSIBLE LINK</text>
              <text x="390" y="195" fill="#fff" fontSize="20" fontWeight="bold" textAnchor="middle">140A</text>

              {/* Smart Alternator Unit */}
              <path d="M 390 135 L 390 70 L 580 70" stroke="#f8fafc" strokeWidth="5" />
              <rect x="580" y="45" width="240" height="130" rx="10" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
              <text x="700" y="75" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                SMART ALTERNATOR (140A)
              </text>
              <text x="700" y="95" fill="#e2e8f0" fontSize="9" textAnchor="middle">
                M8 B+ Terminal (14.2V Max Charge)
              </text>
              <text x="700" y="125" fill="#8b5cf6" fontSize="9" textAnchor="middle">
                LIN Transceiver Pin (ECM Pin 10A)
              </text>
            </svg>
          )}

          {/* SHEET 4: GROUND NETWORKS */}
          {selectedSheet === 'grounds' && (
            <svg viewBox="0 0 960 420" className="w-full h-auto font-mono text-xs bg-neutral-950 rounded-xl border border-neutral-800 shadow-2xl">
              <text x="24" y="32" fill="#10b981" fontSize="13" fontWeight="bold">
                EWD: GROUND NETWORKS (EB, EC) & SHIELD COAXIAL DRAINS
              </text>
              <text x="24" y="48" fill="#64748b" fontSize="10">
                Ground Stud EB (Chassis Strut) · Ground Stud EC (Cylinder Head) · Shield Noise Drains
              </text>

              {/* Master Ground Stud EB */}
              <rect x="60" y="80" width="840" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <text x="480" y="105" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                CHASSIS MASTER GROUND STUD EB (LEFT STRUT TOWER M8)
              </text>

              {/* Battery Negative Cable to EB */}
              <rect x="80" y="180" width="160" height="80" rx="6" fill="#0f172a" stroke="#94a3b8" />
              <text x="160" y="210" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">12V BATTERY</text>
              <text x="160" y="230" fill="#94a3b8" fontSize="9" textAnchor="middle">Negative Post (4 AWG)</text>
              <line x1="160" y1="180" x2="160" y2="120" stroke="#111827" strokeWidth="6" />

              {/* ECM Power Ground PGND */}
              <rect x="360" y="180" width="180" height="80" rx="6" fill="#064e3b" stroke="#22c55e" />
              <text x="450" y="210" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">ECM PIN 13A</text>
              <text x="450" y="230" fill="#94a3b8" fontSize="9" textAnchor="middle">PGND Power Stage Ground</text>
              <line x1="450" y1="180" x2="450" y2="120" stroke="#f8fafc" strokeWidth="4" strokeDasharray="6,3" />

              {/* Cylinder Head Ground Stud EC */}
              <rect x="60" y="320" width="840" height="50" rx="8" fill="#14532d" stroke="#10b981" strokeWidth="2" />
              <text x="480" y="350" fill="#86efac" fontSize="12" fontWeight="bold" textAnchor="middle">
                ENGINE CYLINDER HEAD GROUND STUD EC (REAR HEAD M8 BOSS)
              </text>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
