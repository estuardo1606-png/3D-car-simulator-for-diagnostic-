import React, { useEffect, useRef, useState } from 'react';
import { PinDefinition, DiagnosticFault } from '../data/electricalData';
import { 
  Play, 
  Pause, 
  Activity, 
  Gauge, 
  Sliders, 
  Zap, 
  Volume2,
  RefreshCw,
  Maximize2
} from 'lucide-react';

interface OscilloscopeDMMProps {
  activePin: PinDefinition | null;
  activeFault: DiagnosticFault | null;
  customResistance: number;
}

export const OscilloscopeDMM: React.FC<OscilloscopeDMMProps> = ({
  activePin,
  activeFault,
  customResistance,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [timebase, setTimebase] = useState<number>(2); // ms/div
  const [voltsPerDiv, setVoltsPerDiv] = useState<number>(2); // V/div
  const [triggerEdge, setTriggerEdge] = useState<'rising' | 'falling'>('rising');
  const [triggerLevel, setTriggerLevel] = useState<number>(2.5); // Volts
  const [instrumentMode, setInstrumentMode] = useState<'dso' | 'dmm'>('dso');

  // Ground voltage drop offset from custom resistance
  const groundOffset = customResistance * 1.2;

  // Determine current active signal type and nominal voltage
  const signalType = activePin?.sigType || 'PULSE5';
  const pinName = activePin ? `${activePin.pin} · ${activePin.name}` : 'IGT1 · Ignition Trigger 1';

  // Check if current probed pin is impacted by active fault
  const isPinFaulted = Boolean(
    activeFault && (
      (activeFault.affectedNodeId === 'coils_pack' && activePin?.pin === 'Pin 3') ||
      (activeFault.affectedNodeId === 'throttle_etcs' && (activePin?.pin === 'Pin 3' || activePin?.pin === 'Pin 1')) ||
      (activeFault.affectedNodeId === 'alternator' && activePin?.pin === 'LIN') ||
      (activeFault.affectedNodeId === 'fan' && activePin?.pin === 'Pin 3') ||
      (activeFault.affectedNodeId === 'knock_sensor' && activePin?.pin === 'Pin 1') ||
      (activeFault.affectedNodeId === 'fusebox' && (activePin?.sigType === 'DC12' || activePin?.pin.includes('EFI'))) ||
      (activeFault.affectedNodeId === 'ground_ec' && activePin?.sigType === 'GND')
    )
  );

  // Computed Real-Time Multimeter Telemetry
  let measuredVdc = '12.62';
  let measuredVac = '0.04';
  let measuredFreq = '12.5 Hz';
  let measuredDuty = '4.2%';
  let measuredResistance = '0.04 Ω';

  if (isPinFaulted && activeFault) {
    if (activeFault.faultType === 'open_circuit') {
      measuredVdc = '0.00';
      measuredFreq = '0.0 Hz';
      measuredDuty = '0.0%';
      measuredResistance = '> 100 kΩ';
    } else if (activeFault.faultType === 'short_ground') {
      measuredVdc = '0.02';
      measuredFreq = '0.0 Hz';
      measuredDuty = '0.0%';
      measuredResistance = '0.01 Ω';
    } else if (activeFault.faultType === 'high_resistance') {
      measuredVdc = groundOffset.toFixed(2);
      measuredResistance = `${customResistance.toFixed(2)} Ω`;
    }
  } else {
    if (signalType === 'PULSE5') {
      measuredVdc = (5.0 + (customResistance > 0.05 ? groundOffset : 0)).toFixed(2);
      measuredFreq = '12.5 Hz';
      measuredDuty = '3.8%';
      measuredResistance = '1.2 kΩ';
    } else if (signalType === 'DC12') {
      measuredVdc = '14.18';
      measuredVac = '0.08';
      measuredFreq = '0.0 Hz';
      measuredDuty = '100%';
      measuredResistance = '0.05 Ω';
    } else if (signalType === 'DC5') {
      measuredVdc = '5.01';
      measuredFreq = '0.0 Hz';
      measuredDuty = '100%';
      measuredResistance = '10.5 kΩ';
    } else if (signalType === 'PWM') {
      measuredVdc = '12.10';
      measuredFreq = '100.0 Hz';
      measuredDuty = '75.2%';
      measuredResistance = '45.0 Ω';
    } else if (signalType === 'GND') {
      measuredVdc = (0.02 + groundOffset).toFixed(2);
      measuredResistance = `${(0.02 + customResistance).toFixed(2)} Ω`;
    } else if (signalType === 'LIN') {
      measuredVdc = '11.85';
      measuredFreq = '19.2 kHz';
      measuredDuty = '48.0%';
      measuredResistance = '30.0 kΩ';
    }
  }

  // Live Canvas Waveform Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!isRunning) return;

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const w = canvas.width;
      const h = canvas.height;

      // 1. CRT Background
      ctx.fillStyle = '#020611';
      ctx.fillRect(0, 0, w, h);

      // 2. Graticule Reticle (10 columns x 8 rows)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      const dx = w / 10;
      const dy = h / 8;

      for (let i = 0; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * dx, 0);
        ctx.lineTo(i * dx, h);
        ctx.stroke();
      }
      for (let j = 0; j <= 8; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * dy);
        ctx.lineTo(w, j * dy);
        ctx.stroke();
      }

      // Center crosshairs tick marks
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();

      // Trigger line indicator
      const triggerY = h * 0.85 - (triggerLevel / (voltsPerDiv * 8)) * h;
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, triggerY);
      ctx.lineTo(w, triggerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Realistic Dynamic Waveform Synthesis
      ctx.strokeStyle = isPinFaulted ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = isPinFaulted ? 'rgba(239, 68, 68, 0.8)' : 'rgba(56, 189, 248, 0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const groundPixelY = h * 0.82 - (groundOffset / (voltsPerDiv * 8)) * h;

      for (let x = 0; x < w; x++) {
        let voltage = 0;

        if (isPinFaulted && activeFault) {
          if (activeFault.faultType === 'open_circuit' || activeFault.faultType === 'short_ground') {
            // Flatline with minor thermal noise
            voltage = (Math.random() - 0.5) * 0.05;
          } else if (activeFault.faultType === 'high_resistance') {
            // Elevated baseline + inductive noise ringing
            const ring = Math.sin(x * 0.15 + frameCount * 0.1) * Math.exp(-((x % 80) / 20));
            voltage = groundOffset + ring * 1.4;
          } else if (activeFault.faultType === 'emi_noise') {
            // Ignition crosstalk spikes on knock sensor trace
            const sparkBurst = (x % 90 < 15) ? (Math.random() * 2.8 - 1.4) : 0;
            voltage = Math.sin((x + frameCount * 3) * 0.1) * 0.15 + sparkBurst;
          }
        } else {
          // Normal Nominal Signals
          if (signalType === 'PULSE5') {
            // 5V Ignition IGT Dwell Pulse Train
            const period = 120 / (timebase / 2);
            const phase = (x + frameCount * 2) % period;
            const isPulse = phase < (period * 0.22);
            voltage = isPulse ? 5.0 : 0.0;
            // Add ground offset if custom resistance set
            if (customResistance > 0.05) voltage += groundOffset;
          } else if (signalType === 'IGF') {
            // 5V Negative Spark Confirmation Pulse
            const period = 120 / (timebase / 2);
            const phase = (x + frameCount * 2) % period;
            voltage = (phase > 20 && phase < 35) ? 0.2 : 4.9;
          } else if (signalType === 'PWM') {
            // 100 Hz Variable Duty Cycle
            const period = 50 / (timebase / 2);
            const phase = (x + frameCount * 4) % period;
            voltage = (phase < period * 0.75) ? 12.0 : 0.0;
          } else if (signalType === 'ANALOG') {
            // Throttle TPS Linear Ramp
            voltage = 0.72 + (Math.sin(frameCount * 0.02) + 1) * 1.6;
          } else if (signalType === 'DC12') {
            // +12.6V - 14.2V DC Rail with alternator 3-phase ripple
            const ripple = Math.sin(x * 0.8 + frameCount * 0.2) * 0.12;
            voltage = 14.18 + ripple;
          } else if (signalType === 'DC5') {
            // Regulated 5.01V
            voltage = 5.01 + (Math.random() - 0.5) * 0.02;
          } else if (signalType === 'LIN' || signalType === 'CAN') {
            // Digital UART packet bursts
            const packet = Math.sin(x * 0.3 + frameCount * 0.15);
            voltage = packet > 0.1 ? 11.8 : 0.5;
          } else if (signalType === 'KNOCK') {
            // Acoustic resonant piezo vibrations
            voltage = Math.sin((x + frameCount * 2) * 0.22) * Math.sin(x * 0.04) * 0.45;
          } else {
            voltage = 0.02 + groundOffset;
          }
        }

        // Convert Voltage to Canvas Y coordinate
        // y = groundPixelY - (voltage / (voltsPerDiv * 8)) * h
        const py = groundPixelY - (voltage / (voltsPerDiv * 8)) * h;

        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }

      ctx.stroke();
      frameCount++;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRunning, timebase, voltsPerDiv, triggerLevel, signalType, isPinFaulted, activeFault, customResistance, groundOffset]);

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-t border-neutral-800 text-xs select-none">
      {/* Top Instrument Status Bar */}
      <div className="px-3.5 py-2 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-sky-400 font-bold">
            <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="truncate max-w-[200px]">{pinName}</span>
          </div>
          {isPinFaulted && (
            <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono text-[10px] font-bold">
              FAULT DETECTED
            </span>
          )}
        </div>

        {/* DSO vs DMM Mode Switch */}
        <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => setInstrumentMode('dso')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              instrumentMode === 'dso' ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Oscilloscope (DSO)
          </button>
          <button
            onClick={() => setInstrumentMode('dmm')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              instrumentMode === 'dmm' ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Multimeter (DMM)
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 min-h-[140px] relative p-2 bg-neutral-950/90 flex flex-col justify-center">
        {instrumentMode === 'dso' ? (
          <div className="relative w-full h-full rounded-lg overflow-hidden border border-neutral-800 crt-screen">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* In-CRT Scale Micro-Badges */}
            <div className="absolute top-1.5 left-2 font-mono text-[10px] text-sky-400/80 bg-neutral-950/70 px-1.5 py-0.5 rounded border border-neutral-800/60 pointer-events-none">
              CH1: {voltsPerDiv}V/DIV · {timebase}ms/DIV
            </div>
            <div className="absolute top-1.5 right-2 font-mono text-[10px] text-amber-400/90 bg-neutral-950/70 px-1.5 py-0.5 rounded border border-neutral-800/60 pointer-events-none">
              TRIG: {triggerLevel}V ({triggerEdge === 'rising' ? '▲' : '▼'})
            </div>
            <div className="absolute bottom-1.5 right-2 font-mono text-[10px] text-emerald-400/80 bg-neutral-950/70 px-1.5 py-0.5 rounded border border-neutral-800/60 pointer-events-none">
              DMM: {measuredVdc} VDC
            </div>
          </div>
        ) : (
          /* High-Contrast Automotive Precision Multimeter Display */
          <div className="w-full h-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 flex flex-col justify-between font-mono">
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span>FLUKE-AUTO PROBE</span>
              <span className="text-emerald-400 font-bold">AUTO-RANGE · RMS</span>
            </div>

            <div className="flex items-baseline justify-between py-2 border-y border-neutral-900">
              <div>
                <span className="text-3xl font-black text-amber-400 tracking-tight tabular-nums">
                  {measuredVdc}
                </span>
                <span className="text-sm font-bold text-neutral-400 ml-1.5">V DC</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-sky-400 tabular-nums">{measuredFreq}</span>
                <div className="text-[10px] text-neutral-500">Frequency</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-1.5 bg-neutral-900 rounded border border-neutral-800">
                <div className="text-neutral-500 text-[9px]">AC Ripple</div>
                <div className="font-bold text-neutral-300">{measuredVac} V</div>
              </div>
              <div className="p-1.5 bg-neutral-900 rounded border border-neutral-800">
                <div className="text-neutral-500 text-[9px]">Duty Cycle</div>
                <div className="font-bold text-neutral-300">{measuredDuty}</div>
              </div>
              <div className="p-1.5 bg-neutral-900 rounded border border-neutral-800">
                <div className="text-neutral-500 text-[9px]">Loop Resistance</div>
                <div className="font-bold text-neutral-300">{measuredResistance}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DSO Hardware Controls Bar */}
      <div className="px-3 py-1.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
              isRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isRunning ? 'Hold' : 'Run'}</span>
          </button>
        </div>

        {/* Timebase Control */}
        <div className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
          <span className="text-neutral-500">Time/Div:</span>
          {[1, 2, 5, 10].map((t) => (
            <button
              key={t}
              onClick={() => setTimebase(t)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                timebase === t ? 'bg-neutral-800 text-sky-400 border border-sky-500/40' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t}ms
            </button>
          ))}
        </div>

        {/* Voltage Scale Control */}
        <div className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
          <span className="text-neutral-500">Volt/Div:</span>
          {[1, 2, 5].map((v) => (
            <button
              key={v}
              onClick={() => setVoltsPerDiv(v)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                voltsPerDiv === v ? 'bg-neutral-800 text-amber-400 border border-amber-500/40' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {v}V
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
