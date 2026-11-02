import React, { useState } from 'react';
import { 
  HARNESS_NODES, 
  FUSE_DATA, 
  TOYOTA_WIRE_COLORS, 
  SubsystemCategory, 
  HarnessNode,
  DiagnosticFault 
} from '../data/electricalData';
import { 
  Search, 
  Layers, 
  Zap, 
  Sliders, 
  ShieldCheck, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LeftSidebarProps {
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  activeFilter: SubsystemCategory;
  onFilterChange: (cat: SubsystemCategory) => void;
  activeFault: DiagnosticFault | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedNodeId,
  onSelectNode,
  activeFilter,
  onFilterChange,
  activeFault,
  isOpen,
  onToggleOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'fuses' | 'colors'>('nodes');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter nodes by category and search
  const filteredNodes = HARNESS_NODES.filter((node) => {
    const matchesCategory = activeFilter === 'all' || node.category === activeFilter;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      node.name.toLowerCase().includes(q) ||
      node.subtitle.toLowerCase().includes(q) ||
      node.pins.some((p) => p.pin.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.colorCode.toLowerCase().includes(q))
    );
  });

  if (!isOpen) {
    return (
      <div className="hidden lg:flex flex-col items-center py-3 bg-neutral-900 border-r border-neutral-800 w-12 shrink-0 z-20">
        <button
          onClick={onToggleOpen}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
          title="Open Component Tree"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 md:w-84 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 z-20 select-none text-xs">
      {/* Search & Collapse Header */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between gap-2 bg-neutral-950/70">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search (IGT1, W-B, Coil, A24)..."
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
          title="Collapse Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Subsystem Quick Filter Pills */}
      <div className="p-2 border-b border-neutral-800 bg-neutral-950/40 flex items-center gap-1 overflow-x-auto text-[11px] font-medium scrollbar-none">
        {(
          [
            ['all', 'All'],
            ['ignition', 'Ignition COP'],
            ['etcs', 'ETCS-i'],
            ['power', 'Power'],
            ['grounds', 'Grounds'],
            ['cooling', 'Cooling'],
          ] as [SubsystemCategory, string][]
        ).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              activeFilter === cat
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-800 text-xs font-semibold bg-neutral-950/50">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'nodes'
              ? 'text-sky-400 border-b-2 border-sky-500 bg-neutral-800/40'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Connectors ({filteredNodes.length})
        </button>
        <button
          onClick={() => setActiveTab('fuses')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'fuses'
              ? 'text-sky-400 border-b-2 border-sky-500 bg-neutral-800/40'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Fuse Box 1
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'colors'
              ? 'text-sky-400 border-b-2 border-sky-500 bg-neutral-800/40'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Color EWD
        </button>
      </div>

      {/* Tab 1: Connectors List */}
      {activeTab === 'nodes' && (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {filteredNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isFaulted = activeFault && activeFault.affectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 border-sky-500 shadow-md'
                    : isFaulted
                    ? 'bg-red-950/60 border-red-500/70 hover:bg-red-900/60'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>{node.name}</span>
                    {isFaulted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                    )}
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-neutral-700"
                    style={{ backgroundColor: `#${node.housingColor.toString(16).padStart(6, '0')}` }}
                  ></span>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate">
                  {node.subtitle}
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-500 font-mono">
                  {node.diagramCallout && (
                    <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                      Tag [{node.diagramCallout}]
                    </span>
                  )}
                  {node.diagramHarness && (
                    <span className={`px-1 rounded text-[9px] ${node.diagramHarness === '82114' ? 'bg-amber-950 text-amber-300' : 'bg-neutral-800 text-neutral-400'}`}>
                      Wire {node.diagramHarness}
                    </span>
                  )}
                  <span>·</span>
                  <span>{node.pins.length} Terminals</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Fuses Matrix */}
      {activeTab === 'fuses' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
              <span>Bus Bar Rail</span>
              <span className="text-amber-400 font-bold">+12V BATT B+</span>
            </div>

            {/* Visual Miniature Fuse Block */}
            <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800 flex flex-wrap gap-1.5 justify-center">
              {FUSE_DATA.map((f) => {
                const isBlown = activeFault?.code === 'P0685' && f.id === 'f_efi' ||
                                activeFault?.code === 'P0350' && f.id === 'f_ign';
                return (
                  <div
                    key={f.id}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold border transition ${
                      isBlown
                        ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                        : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:border-sky-400'
                    }`}
                    title={`${f.name} - ${f.rating} (${f.circuit})`}
                  >
                    {f.name} {f.rating} {isBlown && '⚠ BLOWN'}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            {FUSE_DATA.map((f) => (
              <div
                key={f.id}
                className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-neutral-200 text-xs flex items-center gap-1.5">
                    <span>{f.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{f.type}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{f.circuit}</div>
                </div>
                <div className="font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-900 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                  {f.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Toyota EWD Color Reference */}
      {activeTab === 'colors' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-neutral-400 text-[11px] leading-relaxed mb-1">
            Toyota Wire Standard: <code className="text-sky-300 font-mono">BaseColor-StripeColor</code>. Grounds are consistently <code className="text-white font-mono">W-B</code> (White with Black tracer).
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(TOYOTA_WIRE_COLORS).map(([code, def]) => (
              <div
                key={code}
                className="p-1.5 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center gap-2"
              >
                <div
                  className="w-5 h-5 rounded border flex items-center justify-center font-mono font-bold text-[9px] shrink-0"
                  style={{
                    backgroundColor: def.hex,
                    color: def.textColor,
                    borderColor: def.stripe || '#334155',
                  }}
                >
                  {code}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold font-mono text-[11px] text-neutral-200 leading-tight">{code}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{def.name.split('(')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono shrink-0">
        <span>Arnés 82111 OEM</span>
        <span className="text-emerald-400 font-semibold">12.6V Active</span>
      </div>
    </aside>
  );
};
