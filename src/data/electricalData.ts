/**
 * Toyota Corolla 2021 SE (M20A-FKS 2.0L Dynamic Force)
 * Engine Wire Harness 82111 & Electrical Architecture Data
 */

export interface WireColorDef {
  name: string;
  hex: string;
  stripe?: string;
  textColor: string;
  description: string;
}

export const TOYOTA_WIRE_COLORS: Record<string, WireColorDef> = {
  'B':   { name: 'Black', hex: '#111827', textColor: '#f8fafc', description: 'Constant Power / Ignition / Sensor' },
  'W':   { name: 'White', hex: '#f8fafc', textColor: '#0f172a', description: 'High Current Power / Sensor Reference' },
  'W-B': { name: 'White / Black Stripe', hex: '#f8fafc', stripe: '#111827', textColor: '#0f172a', description: 'Chassis & Engine Block Ground (EB, EC)' },
  'BR':  { name: 'Brown', hex: '#78350f', textColor: '#f8fafc', description: 'Sensor Analog Ground (ETA)' },
  'R':   { name: 'Red', hex: '#dc2626', textColor: '#f8fafc', description: 'Battery Positive 12V / Throttle Drive M-' },
  'G':   { name: 'Green', hex: '#16a34a', textColor: '#f8fafc', description: 'Switched Ignition IGSW / Throttle Drive M+' },
  'L':   { name: 'Blue', hex: '#2563eb', textColor: '#f8fafc', description: 'Regulated 5V Reference / IGT3' },
  'Y':   { name: 'Yellow', hex: '#eab308', textColor: '#0f172a', description: 'IGT2 / TPS VTA2 / CAN-High' },
  'LG':  { name: 'Light Green', hex: '#4ade80', textColor: '#0f172a', description: 'Cooling Fan RFC PWM Control' },
  'GR':  { name: 'Gray', hex: '#64748b', textColor: '#f8fafc', description: 'Starter Solenoid STA Terminal 50' },
  'P':   { name: 'Pink', hex: '#ec4899', textColor: '#f8fafc', description: 'Fuel Injector Nozzle Trigger' },
  'V':   { name: 'Violet', hex: '#8b5cf6', textColor: '#f8fafc', description: 'Smart Alternator LIN Bus Communication' },
  'SB':  { name: 'Sky Blue', hex: '#38bdf8', textColor: '#0f172a', description: 'Air-Fuel Ratio Sensor Heaters' },
  'O':   { name: 'Orange', hex: '#ea580c', textColor: '#f8fafc', description: 'VVT-i Intake Cam Phaser Oil Solenoid' },
  'B-W': { name: 'Black / White Stripe', hex: '#111827', stripe: '#f8fafc', textColor: '#f8fafc', description: 'Ignition Confirmation IGF Signal Bus' },
  'B-R': { name: 'Black / Red Stripe', hex: '#111827', stripe: '#dc2626', textColor: '#f8fafc', description: 'EFI Main Relay Switched High Current' },
  'R-W': { name: 'Red / White Stripe', hex: '#dc2626', stripe: '#f8fafc', textColor: '#f8fafc', description: 'Fuel Pump Speed Control' },
  'L-B': { name: 'Blue / Black Stripe', hex: '#2563eb', stripe: '#111827', textColor: '#f8fafc', description: 'Fan Motor 30A Protected Line' },
  'L-W': { name: 'Blue / White Stripe', hex: '#2563eb', stripe: '#f8fafc', textColor: '#f8fafc', description: 'Accelerator Pedal APPS1 Signal' },
  'SHIELD': { name: 'Braided Shield', hex: '#475569', stripe: '#94a3b8', textColor: '#f8fafc', description: 'Grounded Coaxial EMI Drain Foil' },
};

export type SignalType = 
  | 'DC12' 
  | 'DC5' 
  | 'GND' 
  | 'PULSE5' 
  | 'PWM' 
  | 'LIN' 
  | 'CAN' 
  | 'IGF' 
  | 'ANALOG' 
  | 'KNOCK'
  | 'INJECTOR';

export interface PinDefinition {
  pin: string;
  name: string;
  colorCode: string;
  func: string;
  sigType: SignalType;
  nominalVoltage: string;
  tolerance: string;
  nominalWaveformDesc: string;
}

export type SubsystemCategory = 
  | 'all' 
  | 'ignition' 
  | 'etcs' 
  | 'power' 
  | 'grounds' 
  | 'cooling'
  | 'sensors';

export interface HarnessNode {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  category: SubsystemCategory;
  coords: [number, number, number];
  housingColor: number;
  componentKind: 'fusebox' | 'ecm_header' | 'coils' | 'ground_lug' | 'grommet' | 'sealed_conn' | 'alternator' | 'starter' | 'injectors';
  housingType: string;
  sealRating: string;
  description: string;
  diagnosticsTip: string;
  diagramCallout?: string; // e.g. 'B', 'D', 'H', 'J', '82712A', '82684', 'C', 'I', 'F', 'E', 'G', 'L', '82114', '82821M'
  diagramHarness?: '82111' | '82114';
  diagramFastener?: string; // e.g. '90119-06A06' | '90119-A0255'
  pins: PinDefinition[];
}

export const HARNESS_NODES: HarnessNode[] = [
  {
    id: 'coils_pack',
    name: 'Ignition Coils COP (1-4)',
    subtitle: 'Direct Connectors C1-C4 (Sumitomo 4-Pin IP67)',
    type: 'Ignition Coil Pack',
    category: 'ignition',
    coords: [0.0, 0.65, -0.45],
    housingColor: 0x0f172a,
    componentKind: 'coils',
    housingType: 'Sumitomo 090 Sealed 4-Way',
    sealRating: 'IP67 Waterproof Silicone Gasket',
    description: 'Four independent Coil-On-Plug units with internal driver igniters positioned directly over spark plugs on the rear cylinder head.',
    diagnosticsTip: 'Check 12V on Pin 1 with ignition ON. Pin 4 must have < 0.2Ω continuity to Engine Ground EC. Pin 3 receives 5V TTL pulse.',
    pins: [
      {
        pin: 'Pin 1',
        name: '+B (Ignition Power)',
        colorCode: 'B',
        func: '12V Switched feed from IGN 10A fuse',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.8 - 14.5 V',
        nominalWaveformDesc: 'Stable DC line with < 50mV alternator AC ripple'
      },
      {
        pin: 'Pin 2',
        name: 'IGF (Feedback Bus)',
        colorCode: 'B-W',
        func: 'Spark confirmation pulse returned to ECM Pin 28A',
        sigType: 'IGF',
        nominalVoltage: '4.9 Vpp',
        tolerance: '4.5 - 5.2 V',
        nominalWaveformDesc: 'Negative 5V logic pulse following primary discharge'
      },
      {
        pin: 'Pin 3',
        name: 'IGT (Trigger Input)',
        colorCode: 'R',
        func: '5V TTL timing trigger pulse from ECM (Cyl 1)',
        sigType: 'PULSE5',
        nominalVoltage: '5.0 Vpp',
        tolerance: '4.8 - 5.2 V',
        nominalWaveformDesc: 'Square pulse, 2.5 - 3.8ms dwell duration at idle'
      },
      {
        pin: 'Pin 4',
        name: 'GND (Cylinder Head)',
        colorCode: 'W-B',
        func: 'High-current ground return to Engine Stud EC',
        sigType: 'GND',
        nominalVoltage: '0.02 VDC',
        tolerance: '< 0.08 V drop',
        nominalWaveformDesc: 'Clean 0V ground floor with minimal inductive bounce'
      }
    ]
  },
  {
    id: 'ecm',
    name: 'Engine Control Module (ECM)',
    subtitle: 'Header A24 (Denso 60-Pin Cam-Locking Header)',
    type: 'Powertrain ECU',
    category: 'ignition',
    coords: [-1.2, 0.7, -0.75],
    housingColor: 0x1e293b,
    componentKind: 'ecm_header',
    housingType: 'Denso 60-Pin Multi-Lock Lever',
    sealRating: 'Hermetic Perimeter O-Ring Seal',
    description: 'Central powertrain microcomputer processing injection, ignition, VVT-i phasers, throttle drive, and onboard OBD-II emissions diagnostics.',
    diagnosticsTip: 'Ensure lever lock is fully seated and latched. Ground pins (13A, 14A) must show < 0.05V drop under load to battery negative.',
    pins: [
      {
        pin: '1A',
        name: 'BATT (KAM Memory)',
        colorCode: 'W',
        func: 'Constant 12V battery feed for keep-alive RAM & DTC memory',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.5 - 14.5 V',
        nominalWaveformDesc: 'Continuous unswitched DC battery voltage'
      },
      {
        pin: '2A',
        name: 'IGSW (Ignition Switch)',
        colorCode: 'G',
        func: '+12V Power Start wake-up trigger signal',
        sigType: 'DC12',
        nominalVoltage: '12.5 VDC',
        tolerance: '11.0 - 14.2 V',
        nominalWaveformDesc: 'Step logic high (12V) when ignition button is active'
      },
      {
        pin: '9A',
        name: '+B (EFI Main Power)',
        colorCode: 'B',
        func: '+12V Switched feed through EFI-MAIN NO.1 relay',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '12.0 - 14.5 V',
        nominalWaveformDesc: 'Stable system supply line'
      },
      {
        pin: '10A',
        name: 'ALT (Smart LIN Bus)',
        colorCode: 'V',
        func: 'Bidirectional LIN transceiver communication with alternator',
        sigType: 'LIN',
        nominalVoltage: '11.8 Vpp',
        tolerance: '9.0 - 13.5 V',
        nominalWaveformDesc: '19.2 kbaud LIN message frames with 12V recessive baseline'
      },
      {
        pin: '13A',
        name: 'PGND (Power Ground)',
        colorCode: 'W-B',
        func: 'Direct chassis power ground terminating at Strut Stud EB',
        sigType: 'GND',
        nominalVoltage: '0.01 VDC',
        tolerance: '< 0.05 V',
        nominalWaveformDesc: 'Zero reference chassis return'
      },
      {
        pin: '24A',
        name: 'IGT1 (Ignition 1 Pulse)',
        colorCode: 'R',
        func: '5V Cylinder 1 dwell command pulse',
        sigType: 'PULSE5',
        nominalVoltage: '5.0 Vpp',
        tolerance: '4.8 - 5.2 V',
        nominalWaveformDesc: 'Crisp 5V positive square wave pulse at 12.5 Hz idle'
      },
      {
        pin: '25A',
        name: 'IGT2 (Ignition 2 Pulse)',
        colorCode: 'Y',
        func: '5V Cylinder 2 dwell command pulse',
        sigType: 'PULSE5',
        nominalVoltage: '5.0 Vpp',
        tolerance: '4.8 - 5.2 V',
        nominalWaveformDesc: '5V square wave shifted 180° crank degrees from IGT1'
      },
      {
        pin: '26A',
        name: 'IGT3 (Ignition 3 Pulse)',
        colorCode: 'L',
        func: '5V Cylinder 3 dwell command pulse',
        sigType: 'PULSE5',
        nominalVoltage: '5.0 Vpp',
        tolerance: '4.8 - 5.2 V',
        nominalWaveformDesc: '5V square wave shifted 540° crank degrees'
      },
      {
        pin: '27A',
        name: 'IGT4 (Ignition 4 Pulse)',
        colorCode: 'G',
        func: '5V Cylinder 4 dwell command pulse',
        sigType: 'PULSE5',
        nominalVoltage: '5.0 Vpp',
        tolerance: '4.8 - 5.2 V',
        nominalWaveformDesc: '5V square wave shifted 360° crank degrees'
      },
      {
        pin: '28A',
        name: 'IGF (Feedback Input)',
        colorCode: 'B-W',
        func: 'Shared return bus confirming secondary ignition ionization',
        sigType: 'IGF',
        nominalVoltage: '4.9 Vpp',
        tolerance: '4.5 - 5.2 V',
        nominalWaveformDesc: 'Successive pulse train matching cylinder firing order 1-3-4-2'
      },
      {
        pin: '60A',
        name: 'RFC (Cooling Fan PWM)',
        colorCode: 'LG',
        func: 'Cooling fan speed command duty cycle',
        sigType: 'PWM',
        nominalVoltage: '12.0 Vpp',
        tolerance: '11.0 - 14.0 V',
        nominalWaveformDesc: '100 Hz variable duty cycle (15% idle to 95% full cooling)'
      }
    ]
  },
  {
    id: 'throttle_etcs',
    name: 'ETCS-i Electronic Throttle',
    subtitle: 'Connector T1 (Denso 6-Pin Sealed Waterproof)',
    type: 'Drive-By-Wire Actuator',
    category: 'etcs',
    coords: [-0.4, 0.45, -0.65],
    housingColor: 0x1e293b,
    componentKind: 'sealed_conn',
    housingType: 'Denso 060 Sealed 6-Way',
    sealRating: 'IP67 Waterproof Rubber Seal',
    description: 'Motorized throttle body featuring a bi-directional H-Bridge DC servo motor and dual non-contact Hall-effect Throttle Position Sensors (TPS).',
    diagnosticsTip: 'VTA1 and VTA2 are inverse linear slopes. At closed throttle, VTA1 is ~0.7V and VTA2 is ~2.3V. Total voltage should not cross sum errors.',
    pins: [
      {
        pin: 'Pin 1',
        name: 'M+ (Motor Open)',
        colorCode: 'G',
        func: 'ECM H-Bridge positive drive for throttle plate opening',
        sigType: 'PWM',
        nominalVoltage: '12.2 Vpp',
        tolerance: 'Variable PWM',
        nominalWaveformDesc: 'High-frequency 2 kHz PWM pulse train driving servo motor'
      },
      {
        pin: 'Pin 2',
        name: 'M- (Motor Close)',
        colorCode: 'R',
        func: 'ECM H-Bridge reverse drive for return throttle control',
        sigType: 'PWM',
        nominalVoltage: '12.2 Vpp',
        tolerance: 'Variable PWM',
        nominalWaveformDesc: 'PWM modulated complementary phase'
      },
      {
        pin: 'Pin 3',
        name: 'VCTA (+5V Reference)',
        colorCode: 'L',
        func: 'Precision regulated 5.00V power to internal Hall sensors',
        sigType: 'DC5',
        nominalVoltage: '5.01 VDC',
        tolerance: '4.95 - 5.05 V',
        nominalWaveformDesc: 'Ultra-low ripple regulated reference'
      },
      {
        pin: 'Pin 4',
        name: 'ETA (Sensor Ground)',
        colorCode: 'BR',
        func: 'Isolated analog signal ground directly to ECM',
        sigType: 'GND',
        nominalVoltage: '0.01 VDC',
        tolerance: '< 0.03 V',
        nominalWaveformDesc: 'Isolated analog reference plane'
      },
      {
        pin: 'Pin 5',
        name: 'VTA1 (Main TPS Signal)',
        colorCode: 'W',
        func: 'Primary Hall position voltage (0.6V idle to 4.3V WOT)',
        sigType: 'ANALOG',
        nominalVoltage: '0.72 VDC',
        tolerance: '0.65 - 4.40 V',
        nominalWaveformDesc: 'Linear analog voltage ramp matching pedal movement'
      },
      {
        pin: 'Pin 6',
        name: 'VTA2 (Sub TPS Signal)',
        colorCode: 'Y',
        func: 'Secondary redundant sensor track (2.2V idle to 4.8V WOT)',
        sigType: 'ANALOG',
        nominalVoltage: '2.35 VDC',
        tolerance: '2.10 - 4.90 V',
        nominalWaveformDesc: 'Offset linear analog voltage track for plausibility cross-check'
      }
    ]
  },
  {
    id: 'fusebox',
    name: 'Engine Junction Block No. 1',
    subtitle: 'Under-Hood Power Distribution & Fuse Links',
    type: 'Fuse & Relay Center',
    category: 'power',
    coords: [-1.4, 0.4, 0.2],
    housingColor: 0x18181b,
    componentKind: 'fusebox',
    housingType: 'Yazaki High-Current Modular Distribution Block',
    sealRating: 'Splashproof Weather Shield Cover',
    description: 'Central distribution hub housing the multi-fuse link bar (ALT 140A), micro ISO relays (EFI, Starter, Horn), and mini blade fuses.',
    diagnosticsTip: 'Check voltage drop across fuse blades (< 5mV). Replace blown cartridge fuses only with exact OEM amperage ratings.',
    pins: [
      {
        pin: 'ALT-140A',
        name: 'Alternator Fuse Link',
        colorCode: 'W',
        func: '140A Main fusible bus direct from battery/alternator post',
        sigType: 'DC12',
        nominalVoltage: '14.2 VDC',
        tolerance: '13.8 - 14.6 V (Running)',
        nominalWaveformDesc: 'Direct battery/generator charging rail'
      },
      {
        pin: 'EPS-80A',
        name: 'Electric Power Steering',
        colorCode: 'B',
        func: '80A High-current cartridge for steering column brushless motor',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.8 - 14.5 V',
        nominalWaveformDesc: 'Continuous power line'
      },
      {
        pin: 'ABS-50A',
        name: 'ABS Skid Control Pump',
        colorCode: 'R',
        func: '50A Feed for hydraulic stability control pump motor',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.5 - 14.5 V',
        nominalWaveformDesc: 'Continuous power feed'
      },
      {
        pin: 'FAN-30A',
        name: 'Cooling Fan Fuse',
        colorCode: 'L-B',
        func: '30A Fuse protecting variable radiator fan module',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.5 - 14.5 V',
        nominalWaveformDesc: 'Protected +12V battery bus'
      },
      {
        pin: 'EFI-25A',
        name: 'EFI Main Relay Circuit',
        colorCode: 'B',
        func: '25A Mini fuse supplying fuel injectors and ECM stage',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '12.0 - 14.5 V',
        nominalWaveformDesc: 'Switched power to engine actuators'
      },
      {
        pin: 'IGN-10A',
        name: 'Ignition Coil Circuit',
        colorCode: 'B',
        func: '10A Dedicated fuse for 4 COP ignition coil igniter stages',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.8 - 14.5 V',
        nominalWaveformDesc: 'Switched ignition line'
      }
    ]
  },
  {
    id: 'alternator',
    name: 'Smart Alternator 140A',
    subtitle: 'Denso Segment Conductor (LIN Controlled)',
    type: 'Charging System',
    category: 'power',
    coords: [0.65, -0.3, 0.4],
    housingColor: 0x475569,
    componentKind: 'alternator',
    housingType: 'M8 Stud Terminal + Oval 3-Way Connector',
    sealRating: 'IP65 Weather Resistant',
    description: 'High-efficiency 140-amp hair-pin alternator equipped with monolithic smart regulator communicating dynamically with the ECM via LIN.',
    diagnosticsTip: 'Under load, output must remain 13.8V - 14.4V. Verify LIN signal data packets between terminal and ECM Pin 10A.',
    pins: [
      {
        pin: 'B+ Stud',
        name: 'Generator Output (M8)',
        colorCode: 'W',
        func: 'High-amperage 14.2V charging output to battery and ALT 140A',
        sigType: 'DC12',
        nominalVoltage: '14.2 VDC',
        tolerance: '13.8 - 14.6 V',
        nominalWaveformDesc: 'Clean 14V DC charging plane with three-phase diode ripple'
      },
      {
        pin: 'LIN',
        name: 'Smart LIN Control',
        colorCode: 'V',
        func: 'Serial communication bus modulating rotor field duty cycle',
        sigType: 'LIN',
        nominalVoltage: '11.8 Vpp',
        tolerance: '9.0 - 13.5 V',
        nominalWaveformDesc: '19.2 kbaud UART byte bursts'
      },
      {
        pin: 'IG',
        name: 'Ignition Feedback',
        colorCode: 'B-W',
        func: 'Ignition voltage sense circuit for regulator wake-up',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.8 - 14.5 V',
        nominalWaveformDesc: 'DC switched voltage'
      }
    ]
  },
  {
    id: 'starter',
    name: 'Starter Motor & Solenoid',
    subtitle: 'Planetary Gear Reduction (Denso 1.4kW)',
    type: 'Starting System',
    category: 'power',
    coords: [-0.2, -0.4, -0.5],
    housingColor: 0x334155,
    componentKind: 'starter',
    housingType: 'Heavy M8 Lug (30) + Push-On Spade (50)',
    sealRating: 'Immersion & Dust Protected',
    description: 'Permanent-magnet reduction starter with integrated magnetic switch engaging the engine flywheel ring gear.',
    diagnosticsTip: 'Terminal 50 must receive > 10.5V during cranking. High resistance here causes clicking solenoid without motor spin.',
    pins: [
      {
        pin: 'Terminal 30',
        name: 'Battery Main Feed',
        colorCode: 'B',
        func: 'Direct heavy gauge (2 AWG) copper cable from positive terminal',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: 'Drops to ~10.2V during crank',
        nominalWaveformDesc: 'Massive transient current draw during engine crank'
      },
      {
        pin: 'Terminal 50',
        name: 'Solenoid Trigger (STA)',
        colorCode: 'GR',
        func: '+12V Trigger from ST relay engaging pinion plunger',
        sigType: 'DC12',
        nominalVoltage: '12.0 VDC',
        tolerance: '10.5 - 13.5 V (Cranking)',
        nominalWaveformDesc: 'Square 12V pulse lasting the duration of the push-button crank'
      }
    ]
  },
  {
    id: 'fan',
    name: 'Electric Cooling Fan Module',
    subtitle: 'Brushless Dual-Speed Fan with Shroud',
    type: 'Thermal Management',
    category: 'cooling',
    coords: [0.0, 0.1, 1.4],
    housingColor: 0x0e7490,
    componentKind: 'sealed_conn',
    housingType: 'Yazaki 3-Pin High Current Sealed',
    sealRating: 'IP67 Submersible Rated',
    description: 'High-flow brushless cooling fan mounted to the radiator assembly, controlled via PWM duty cycle from the ECM.',
    diagnosticsTip: 'Pin 3 receives a 100 Hz variable duty cycle signal (RFC). Low duty (15%) = slow, High duty (> 85%) = maximum cooling CFM.',
    pins: [
      {
        pin: 'Pin 1',
        name: '+B Power (30A)',
        colorCode: 'L-B',
        func: '12V Power through FAN NO.1 30A fuse link',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.5 - 14.5 V',
        nominalWaveformDesc: 'High-current DC supply line'
      },
      {
        pin: 'Pin 2',
        name: 'GND (Chasis EB)',
        colorCode: 'W-B',
        func: 'Heavy ground lead to Chassis Ground Point EB',
        sigType: 'GND',
        nominalVoltage: '0.02 VDC',
        tolerance: '< 0.10 V drop under full fan load',
        nominalWaveformDesc: 'Ground return'
      },
      {
        pin: 'Pin 3',
        name: 'RFC (PWM Control)',
        colorCode: 'LG',
        func: '100 Hz Speed modulation signal from ECM Pin 60A',
        sigType: 'PWM',
        nominalVoltage: '12.0 Vpp',
        tolerance: '10 - 90% Duty Cycle',
        nominalWaveformDesc: 'Clean 100 Hz square wave duty cycle'
      }
    ]
  },
  {
    id: 'knock_sensor',
    name: 'Knock Sensor (Piezoelectric)',
    subtitle: 'Block Center Bore (Coaxial Shielded)',
    type: 'Engine Acoustic Sensor',
    category: 'grounds',
    coords: [0.15, 0.05, -0.55],
    housingColor: 0x0284c7,
    componentKind: 'sealed_conn',
    housingType: 'Sumitomo Coaxial Waterproof',
    sealRating: 'IP67 High Temp Vibration Resistant',
    description: 'Flat-response piezoceramic sensor screwed to the engine block detects engine detonation vibrations and frequencies ~6-8 kHz.',
    diagnosticsTip: 'Shield foil MUST be grounded exclusively at EC. Broken shield introduces ignition noise resulting in false spark retard.',
    pins: [
      {
        pin: 'Pin 1',
        name: 'KNK1 (Acoustic Signal)',
        colorCode: 'B',
        func: 'Piezoelectric micro-volt signal generating 6-8 kHz spikes',
        sigType: 'KNOCK',
        nominalVoltage: '0.25 Vpp',
        tolerance: '0.05 - 1.20 Vpp AC',
        nominalWaveformDesc: 'High-frequency AC acoustic resonant ringing'
      },
      {
        pin: 'Pin 2',
        name: 'EKNK (Sensor Return)',
        colorCode: 'W',
        func: 'Balanced differential sensor return to ECM',
        sigType: 'GND',
        nominalVoltage: '0.02 VDC',
        tolerance: '< 0.05 V',
        nominalWaveformDesc: 'Balanced reference ground'
      },
      {
        pin: 'Shield',
        name: 'Coaxial Shield Drain',
        colorCode: 'SHIELD',
        func: 'Tinned copper braided shield absorbing electromagnetic radiation',
        sigType: 'GND',
        nominalVoltage: '0.00 VDC',
        tolerance: '0.00 V',
        nominalWaveformDesc: 'Solid chassis drain plane at Cylinder Head EC'
      }
    ]
  },
  {
    id: 'ground_ec',
    name: 'Ground Stud EC (Cylinder Head)',
    subtitle: 'Rear Engine Head M8 Copper Eyelet Lug',
    type: 'Engine Block Ground',
    category: 'grounds',
    coords: [0.45, 0.5, -0.6],
    housingColor: 0xb45309,
    componentKind: 'ground_lug',
    housingType: 'M8 Tinned Brass Ring Terminal',
    sealRating: 'Direct Mechanical Fastener',
    description: 'Primary low-impedance ground point for ignition coils C1-C4 and sensor shield drains bolted directly to the cylinder head.',
    diagnosticsTip: 'Inspect for corrosion or loose bolt. Voltage drop to battery negative must be strictly < 0.05V with coils operating.',
    pins: [
      {
        pin: 'Lug 1',
        name: 'Coils Return (W-B)',
        colorCode: 'W-B',
        func: 'Ignition primary and secondary discharge current return',
        sigType: 'GND',
        nominalVoltage: '0.02 VDC',
        tolerance: '< 0.05 V',
        nominalWaveformDesc: 'Low-noise ground reference'
      },
      {
        pin: 'Lug 2',
        name: 'Shield Drains',
        colorCode: 'SHIELD',
        func: 'Drains for Knock and Crankshaft sensor coaxial cables',
        sigType: 'GND',
        nominalVoltage: '0.00 VDC',
        tolerance: '< 0.02 V',
        nominalWaveformDesc: 'Zero volt EMI dump'
      }
    ]
  },
  {
    id: 'ground_eb',
    name: 'Ground Stud EB (Chassis Strut)',
    subtitle: 'Left Front Suspension Tower M8 Stud',
    type: 'Chassis Main Ground',
    category: 'grounds',
    coords: [-1.45, 0.5, -0.1],
    housingColor: 0xb45309,
    componentKind: 'ground_lug',
    housingType: 'M8 Double-Lug Chassis Eyelet',
    sealRating: 'Direct Mechanical Fastener',
    description: 'Main body ground stud connecting battery negative, ECM power grounds, cooling fan, and front lighting to the vehicle unibody.',
    diagnosticsTip: 'Test continuity to battery negative terminal. Must read 0.0Ω. High resistance will cause random DTCs and sensor drift.',
    pins: [
      {
        pin: 'Lug 1',
        name: 'Battery Negative Return',
        colorCode: 'B',
        func: 'Heavy 4 AWG ground cable connecting to negative battery post',
        sigType: 'GND',
        nominalVoltage: '0.00 VDC',
        tolerance: '< 0.02 V drop',
        nominalWaveformDesc: 'Master battery return reference'
      },
      {
        pin: 'Lug 2',
        name: 'Subsystem Ground (W-B)',
        colorCode: 'W-B',
        func: 'Common return for radiator fan, ECM PGND, and front harness',
        sigType: 'GND',
        nominalVoltage: '0.01 VDC',
        tolerance: '< 0.04 V',
        nominalWaveformDesc: 'Clean body ground plane'
      }
    ]
  },
  {
    id: 'firewall_grommet',
    name: 'Firewall Bulkhead Grommet',
    subtitle: 'Bulkhead Pass-Through IA1 / IA2 (Cabin)',
    type: 'Body Interconnect',
    category: 'power',
    coords: [-0.85, 0.55, -1.2],
    housingColor: 0x09090b,
    componentKind: 'grommet',
    housingType: 'EPDM Molded Pass-Through with Locking Collar',
    sealRating: 'Acoustic & Hermetic Firewall Seal',
    description: 'Acoustic and waterproof pass-through sealing the main engine harness through the firewall to the interior instrument panel.',
    diagnosticsTip: 'Houses high-speed CAN bus (pins CAN-H and CAN-L) with 60Ω termination resistance between them with battery disconnected.',
    pins: [
      {
        pin: 'CAN-H',
        name: 'CAN High Network',
        colorCode: 'Y',
        func: 'High-speed 500 kbps powertrain bus (recessive 2.5V, dominant 3.5V)',
        sigType: 'CAN',
        nominalVoltage: '2.50 VDC',
        tolerance: '2.40 - 3.60 V',
        nominalWaveformDesc: 'Differential high bus active 3.5V pulse frames'
      },
      {
        pin: 'CAN-L',
        name: 'CAN Low Network',
        colorCode: 'W',
        func: 'High-speed 500 kbps powertrain bus (recessive 2.5V, dominant 1.5V)',
        sigType: 'CAN',
        nominalVoltage: '2.50 VDC',
        tolerance: '1.40 - 2.60 V',
        nominalWaveformDesc: 'Differential low bus active 1.5V complementary frames'
      },
      {
        pin: 'APPS1',
        name: 'Accelerator Pedal 1',
        colorCode: 'L-W',
        func: 'Pedal position input from cabin drive-by-wire module',
        sigType: 'ANALOG',
        nominalVoltage: '0.85 VDC',
        tolerance: '0.70 - 4.20 V',
        nominalWaveformDesc: 'Smooth analog ramp based on accelerator pedal travel'
      }
    ]
  },
  {
    id: 'abs_ecu',
    name: 'ABS / VSC Skid Control ECU',
    subtitle: 'Electrohydraulic Actuator Assembly',
    type: 'Active Vehicle Dynamics',
    category: 'power',
    coords: [1.1, 0.4, -0.6],
    housingColor: 0x1e293b,
    componentKind: 'sealed_conn',
    housingType: 'Tyco AMP 38-Pin Waterproof Locking Header',
    sealRating: 'IP67 Weatherproof',
    description: 'Hydraulic modulator and ECU providing Anti-lock Braking, Vehicle Stability Control, and Active Cornering Assist.',
    diagnosticsTip: 'Check 12V supply from ABS MTR 50A fuse. Monitor CAN bus data exchanging wheel speed PIDs with ECM.',
    pins: [
      {
        pin: '+BM',
        name: '+12V Motor Supply',
        colorCode: 'R',
        func: 'Direct power from ABS MTR 50A cartridge fuse',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.5 - 14.5 V',
        nominalWaveformDesc: 'High-capacity DC rail'
      },
      {
        pin: 'CAN-H',
        name: 'CAN High VSC',
        colorCode: 'Y',
        func: 'High-speed telemetry communicating with ECM and radar',
        sigType: 'CAN',
        nominalVoltage: '2.50 VDC',
        tolerance: '2.40 - 3.60 V',
        nominalWaveformDesc: 'Differential CAN packets'
      },
      {
        pin: 'CAN-L',
        name: 'CAN Low VSC',
        colorCode: 'W',
        func: 'Differential complementary CAN channel',
        sigType: 'CAN',
        nominalVoltage: '2.50 VDC',
        tolerance: '1.40 - 2.60 V',
        nominalWaveformDesc: 'Complementary differential signal'
      }
    ]
  },
  {
    id: 'headlight_lh',
    name: 'Bi-LED Headlamp LH',
    subtitle: 'Driver Side Front Lighting Assembly',
    type: 'Lighting Subsystem',
    category: 'power',
    coords: [-1.4, 0.3, 1.7],
    housingColor: 0x1e293b,
    componentKind: 'sealed_conn',
    housingType: 'Sealed 8-Pin Projector Header',
    sealRating: 'IP67 Waterproof',
    description: 'Bi-LED forward illumination projector with integrated daytime running light and auto-leveling stepper.',
    diagnosticsTip: 'Supply voltage switched through H-LP LH 10A fuse; ground returned to Strut Tower Ground EB.',
    pins: [
      {
        pin: 'Pin 1',
        name: 'GND Return',
        colorCode: 'W-B',
        func: 'Ground return to Chassis Stud EB',
        sigType: 'GND',
        nominalVoltage: '0.01 VDC',
        tolerance: '< 0.05 V',
        nominalWaveformDesc: 'Clean ground line'
      },
      {
        pin: 'Pin 2',
        name: '+12V Low Beam',
        colorCode: 'W',
        func: '12V Switched feed for LED driver ballast',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.8 - 14.5 V',
        nominalWaveformDesc: 'DC switched voltage'
      }
    ]
  },
  {
    id: 'headlight_rh',
    name: 'Bi-LED Headlamp RH',
    subtitle: 'Passenger Side Front Lighting Assembly',
    type: 'Lighting Subsystem',
    category: 'power',
    coords: [1.4, 0.3, 1.7],
    housingColor: 0x1e293b,
    componentKind: 'sealed_conn',
    housingType: 'Sealed 8-Pin Projector Header',
    sealRating: 'IP67 Waterproof',
    description: 'Bi-LED headlight fed by the front cross-member transverse branch of wire harness 82111.',
    diagnosticsTip: 'Check continuity across transverse harness running over radiator top support.',
    pins: [
      {
        pin: 'Pin 1',
        name: 'GND Return',
        colorCode: 'W-B',
        func: 'Ground return to chassis bracket',
        sigType: 'GND',
        nominalVoltage: '0.01 VDC',
        tolerance: '< 0.05 V',
        nominalWaveformDesc: 'Clean ground line'
      },
      {
        pin: 'Pin 2',
        name: '+12V Low Beam',
        colorCode: 'W',
        func: '12V Switched feed for LED driver ballast',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.8 - 14.5 V',
        nominalWaveformDesc: 'DC switched voltage'
      }
    ]
  },
  {
    id: 'clamp_82712A',
    name: 'Firewall Clamp Block 82712A',
    subtitle: 'Center Cowl Retainer (Bolt 90119-06A06 / 90119-A0255)',
    type: 'OEM Chassis Clamp',
    category: 'grounds',
    coords: [0.0, 0.72, -1.22],
    housingColor: 0x64748b,
    componentKind: 'ground_lug',
    housingType: 'Toyota 82712A Wire Support Retainer',
    sealRating: 'Direct Mechanical Fastener',
    diagramCallout: '82712A',
    diagramHarness: '82111',
    diagramFastener: '90119-06A06(2) / 90119-A0255(2)',
    description: 'Central firewall main harness support bracket holding the main 82111 trunk securely against the dash panel.',
    diagnosticsTip: 'Check dual ground bolt torque (12 Nm) to ensure chassis bonding.',
    pins: [
      {
        pin: 'Bolt 1',
        name: 'Chassis Fastener 90119-06A06',
        colorCode: 'W-B',
        func: 'Dash panel structural bonding fastener',
        sigType: 'GND',
        nominalVoltage: '0.00 VDC',
        tolerance: '< 0.02 V',
        nominalWaveformDesc: 'Solid chassis ground plane'
      }
    ]
  },
  {
    id: 'junction_82114',
    name: 'Main-to-Front Harness Joint 82114',
    subtitle: 'LH Apron Interconnect (Red Circled in Diagram)',
    type: 'Harness Interconnect Joint',
    category: 'power',
    coords: [-1.45, 0.28, 1.25],
    housingColor: 0xeab308,
    componentKind: 'sealed_conn',
    housingType: 'Toyota 82111-to-82114 Interconnect Coupling',
    sealRating: 'IP67 Waterproof Submersible Splash Area',
    diagramCallout: '82114 (Joint)',
    diagramHarness: '82114',
    diagramFastener: '90119-06A06(2) / 90119-A0255(2)',
    description: 'Critical front unibody junction circled in red in the OEM diagram where the Main Engine Room Wire 82111 branches into the Front Bumper Wire 82114.',
    diagnosticsTip: 'Common location for road spray corrosion. Test continuity through the 12-pin connector coupling and verify bolt 90119-06A06 bracket tightness.',
    pins: [
      {
        pin: 'Pin 1',
        name: '+12V Front Lighting Bus',
        colorCode: 'W',
        func: 'Main switched power to front lighting and sensors',
        sigType: 'DC12',
        nominalVoltage: '12.6 VDC',
        tolerance: '11.8 - 14.5 V',
        nominalWaveformDesc: 'Stable DC rail'
      },
      {
        pin: 'Pin 2',
        name: 'GND Front Crossmember',
        colorCode: 'W-B',
        func: 'Return ground bonded via bolt 90119-06A06',
        sigType: 'GND',
        nominalVoltage: '0.01 VDC',
        tolerance: '< 0.04 V',
        nominalWaveformDesc: 'Zero volt ground return'
      },
      {
        pin: 'Pin 3',
        name: 'RFC Fan Signal Cross',
        colorCode: 'LG',
        func: 'Fan PWM command line feeding into front harness 82114',
        sigType: 'PWM',
        nominalVoltage: '12.0 Vpp',
        tolerance: '10 - 90% Duty Cycle',
        nominalWaveformDesc: '100 Hz variable duty cycle'
      }
    ]
  },
  {
    id: 'fan_clamp_82821M',
    name: 'Radiator Fan Retainer 82821M',
    subtitle: 'Lower Core Support Wire Retainer (Harness 82114)',
    type: 'OEM Clamp & Bracket',
    category: 'cooling',
    coords: [0.0, -0.05, 1.58],
    housingColor: 0x0284c7,
    componentKind: 'sealed_conn',
    housingType: 'Toyota 82821M Shroud Snap Clamp',
    sealRating: 'IP67 Weatherproof',
    diagramCallout: '82821M',
    diagramHarness: '82114',
    description: 'Molded nylon clip bracket 82821M securing the lower branch of harness 82114 directly to the radiator cooling fan shroud.',
    diagnosticsTip: 'Inspect clip integrity to prevent harness chafing against the serpentine belt or lower radiator hose.',
    pins: [
      {
        pin: 'Clip 1',
        name: 'Loom Retainer Bracket',
        colorCode: 'B',
        func: 'Vibration isolation clamp on radiator lower crossmember',
        sigType: 'GND',
        nominalVoltage: '0.00 VDC',
        tolerance: 'N/A',
        nominalWaveformDesc: 'Structural retention'
      }
    ]
  }
];

export interface HarnessRun {
  id: string;
  name: string;
  from: string;
  to: string;
  waypoints: [number, number, number][];
  category: SubsystemCategory;
  radius: number;
  wireColors: string[];
  harnessTag?: '82111' | '82114';
}

export const OEM_DIAGRAM_IMAGE_PATH = '/assets/aistudio/1000020786_83fd68c9.jpg';

export interface DiagramHotspot {
  callout: string;
  name: string;
  partNumber: string;
  fastener?: string;
  harness: '82111' | '82114';
  xPercent: number; // percentage coordinate in image
  yPercent: number;
  nodeId: string;
  description: string;
  isRedCircledArea?: boolean;
}

export const OEM_DIAGRAM_HOTSPOTS: DiagramHotspot[] = [
  { callout: 'B', name: 'Left Apron & Ground EB', partNumber: '82111 Branch B', fastener: '90119-06A06', harness: '82111', xPercent: 17.5, yPercent: 31.0, nodeId: 'ground_eb', description: 'Left shock tower chassis ground stud & battery return junction' },
  { callout: 'D', name: 'ECM Header A24', partNumber: '82111 Branch D', harness: '82111', xPercent: 28.5, yPercent: 31.0, nodeId: 'ecm', description: 'Engine Control Module 60-pin cam-lock connection' },
  { callout: 'H', name: 'ETCS-i Throttle & Intake', partNumber: '82111 Branch H', harness: '82111', xPercent: 32.5, yPercent: 31.0, nodeId: 'throttle_etcs', description: 'Drive-by-wire motorized throttle and dual Hall TPS' },
  { callout: 'J', name: 'COP Coils & Head Ground', partNumber: '82111 Branch J', harness: '82111', xPercent: 42.0, yPercent: 31.0, nodeId: 'coils_pack', description: 'Direct ignition coils 1-4 and rear head ground stud EC' },
  { callout: '82712A', name: 'Center Firewall Clamp', partNumber: '82712A', fastener: '90119-06A06(2) / 90119-A0255(2)', harness: '82111', xPercent: 51.5, yPercent: 33.5, nodeId: 'clamp_82712A', description: 'Central dash panel main harness support bracket' },
  { callout: '82684', name: 'Relay Tray Bracket', partNumber: '82684', fastener: '90119-06A06', harness: '82111', xPercent: 60.5, yPercent: 33.5, nodeId: 'fusebox', description: 'Engine junction block No. 1 and relay tray support bracket' },
  { callout: 'C', name: 'Junction Block No. 1', partNumber: '82111 Branch C', harness: '82111', xPercent: 66.0, yPercent: 31.0, nodeId: 'fusebox', description: 'High-current 140A ALT fusible link and primary power rail' },
  { callout: 'I', name: 'Starter & Transmission', partNumber: '82111 Branch I', harness: '82111', xPercent: 70.0, yPercent: 31.0, nodeId: 'starter', description: 'Starter motor terminal 50 and solenoid battery feed' },
  { callout: 'F', name: 'Smart Alternator 140A', partNumber: '82111 Branch F', harness: '82111', xPercent: 74.5, yPercent: 31.0, nodeId: 'alternator', description: 'Hairpin stator alternator and LIN bus communication' },
  { callout: 'E', name: 'ABS Skid Control ECU', partNumber: '82111 Branch E', harness: '82111', xPercent: 86.0, yPercent: 31.0, nodeId: 'abs_ecu', description: 'VSC hydraulic modulator and wheel speed sensor bus' },
  { callout: 'G', name: 'Right Headlamp & Radar', partNumber: '82111/82114 Branch G', harness: '82114', xPercent: 93.0, yPercent: 31.0, nodeId: 'headlight_rh', description: 'Right Bi-LED projector and front millimeter-wave radar' },
  { callout: 'L', name: 'Cabin Bulkhead Pass', partNumber: '82111 Branch L', harness: '82111', xPercent: 98.0, yPercent: 31.0, nodeId: 'firewall_grommet', description: 'IA1/IA2 grommet feeding cabin instrument panel' },
  { callout: '82114', name: 'Front Frame Interconnect Joint', partNumber: '82114 Joint', fastener: '90119-06A06(2) / 90119-A0255(2)', harness: '82114', xPercent: 19.5, yPercent: 74.5, nodeId: 'junction_82114', description: 'Red circled area: Interconnection joint between Main Wire 82111 and Front Bumper Wire 82114 at left front apron rail', isRedCircledArea: true },
  { callout: '82821M', name: 'Radiator Fan Retainer', partNumber: '82821M', harness: '82114', xPercent: 55.0, yPercent: 95.0, nodeId: 'fan_clamp_82821M', description: 'Lower crossmember clamp supporting variable radiator cooling fan module' },
];

export const HARNESS_RUNS: HarnessRun[] = [
  {
    id: 'run_fuse_to_ecm',
    name: 'Power Feed to ECM',
    from: 'fusebox',
    to: 'ecm',
    waypoints: [ [-1.4, 0.4, 0.2], [-1.35, 0.55, -0.2], [-1.2, 0.7, -0.75] ],
    category: 'ignition',
    radius: 0.045,
    wireColors: ['W', 'B', 'L', 'LG', 'V']
  },
  {
    id: 'run_ecm_to_coils',
    name: 'COP Ignition Rail (IGT1-4 & IGF)',
    from: 'ecm',
    to: 'coils_pack',
    waypoints: [ [-1.2, 0.7, -0.75], [-0.6, 0.68, -0.7], [-0.2, 0.67, -0.55], [0.0, 0.65, -0.45] ],
    category: 'ignition',
    radius: 0.038,
    wireColors: ['R', 'Y', 'L', 'G', 'B-W', 'B']
  },
  {
    id: 'run_ecm_to_etcs',
    name: 'ETCS-i Throttle Drive & TPS',
    from: 'ecm',
    to: 'throttle_etcs',
    waypoints: [ [-1.2, 0.7, -0.75], [-0.8, 0.58, -0.72], [-0.4, 0.45, -0.65] ],
    category: 'etcs',
    radius: 0.032,
    wireColors: ['G', 'R', 'L', 'BR', 'W', 'Y']
  },
  {
    id: 'run_ecm_to_firewall',
    name: 'Cabin Bulkhead & CAN Bus',
    from: 'ecm',
    to: 'firewall_grommet',
    waypoints: [ [-1.2, 0.7, -0.75], [-1.0, 0.62, -1.0], [-0.85, 0.55, -1.2] ],
    category: 'power',
    radius: 0.042,
    wireColors: ['Y', 'W', 'G', 'L-W']
  },
  {
    id: 'run_coils_to_ground_ec',
    name: 'Ignition Return to Head Ground EC',
    from: 'coils_pack',
    to: 'ground_ec',
    waypoints: [ [0.0, 0.65, -0.45], [0.25, 0.58, -0.52], [0.45, 0.5, -0.6] ],
    category: 'grounds',
    radius: 0.03,
    wireColors: ['W-B', 'SHIELD']
  },
  {
    id: 'run_knock_to_ecm',
    name: 'Knock Sensor Shielded Lead',
    from: 'knock_sensor',
    to: 'ecm',
    waypoints: [ [0.15, 0.05, -0.55], [-0.3, 0.25, -0.6], [-0.9, 0.48, -0.7], [-1.2, 0.7, -0.75] ],
    category: 'grounds',
    radius: 0.026,
    wireColors: ['SHIELD', 'B', 'W']
  },
  {
    id: 'run_fuse_to_alt',
    name: 'Alternator Charging Bus (140A)',
    from: 'fusebox',
    to: 'alternator',
    waypoints: [ [-1.4, 0.4, 0.2], [-0.8, 0.1, 0.3], [0.0, -0.1, 0.35], [0.65, -0.3, 0.4] ],
    category: 'power',
    radius: 0.05,
    wireColors: ['W', 'V', 'B-W']
  },
  {
    id: 'run_fuse_to_starter',
    name: 'Starter Power & STA Solenoid',
    from: 'fusebox',
    to: 'starter',
    waypoints: [ [-1.4, 0.4, 0.2], [-0.9, 0.1, -0.2], [-0.5, -0.2, -0.4], [-0.2, -0.4, -0.5] ],
    category: 'power',
    radius: 0.04,
    wireColors: ['B', 'GR']
  },
  {
    id: 'run_fuse_to_fan',
    name: 'Radiator Fan Power & RFC',
    from: 'fusebox',
    to: 'fan',
    waypoints: [ [-1.4, 0.4, 0.2], [-1.0, 0.2, 0.9], [-0.4, 0.15, 1.3], [0.0, 0.1, 1.4] ],
    category: 'cooling',
    radius: 0.038,
    wireColors: ['L-B', 'W-B', 'LG']
  },
  {
    id: 'run_fuse_to_headlight_lh',
    name: 'Front Left Projector Lead',
    from: 'fusebox',
    to: 'headlight_lh',
    waypoints: [ [-1.4, 0.4, 0.2], [-1.45, 0.35, 0.9], [-1.4, 0.3, 1.7] ],
    category: 'power',
    radius: 0.032,
    wireColors: ['W', 'W-B', 'R']
  },
  {
    id: 'run_front_cross_to_rh',
    name: 'Transverse Radiator Support Loom',
    from: 'fan',
    to: 'headlight_rh',
    waypoints: [ [0.0, 0.1, 1.4], [0.7, 0.18, 1.55], [1.4, 0.3, 1.7] ],
    category: 'power',
    radius: 0.032,
    wireColors: ['W', 'W-B', 'R']
  },
  {
    id: 'run_fuse_to_abs',
    name: 'ABS Skid Control Power Rail',
    from: 'fusebox',
    to: 'abs_ecu',
    waypoints: [ [-1.4, 0.4, 0.2], [-0.6, 0.5, -0.7], [0.4, 0.5, -0.7], [1.1, 0.4, -0.6] ],
    category: 'power',
    radius: 0.042,
    wireColors: ['R', 'B-R', 'W-B', 'Y', 'W']
  },
  {
    id: 'run_fuse_to_ground_eb',
    name: 'Master Battery & Chassis Return',
    from: 'fusebox',
    to: 'ground_eb',
    waypoints: [ [-1.4, 0.4, 0.2], [-1.42, 0.45, 0.05], [-1.45, 0.5, -0.1] ],
    category: 'grounds',
    radius: 0.035,
    wireColors: ['W-B', 'B'],
    harnessTag: '82111'
  },
  {
    id: 'run_joint_82114',
    name: 'LH Apron Interconnect to Front Wire 82114 (Red Circle)',
    from: 'fusebox',
    to: 'junction_82114',
    waypoints: [ [-1.4, 0.4, 0.2], [-1.46, 0.35, 0.7], [-1.45, 0.28, 1.25] ],
    category: 'power',
    radius: 0.038,
    wireColors: ['Y', 'W', 'W-B', 'LG'],
    harnessTag: '82114'
  },
  {
    id: 'run_front_bumper_82114',
    name: 'Front Bumper Wire 82114 (Yellow in Diagram)',
    from: 'junction_82114',
    to: 'headlight_rh',
    waypoints: [ [-1.45, 0.28, 1.25], [-0.85, 0.12, 1.55], [0.0, -0.05, 1.58], [0.85, 0.14, 1.55], [1.4, 0.3, 1.7] ],
    category: 'power',
    radius: 0.034,
    wireColors: ['Y', 'W', 'W-B', 'LG'],
    harnessTag: '82114'
  },
  {
    id: 'run_clamp_82712A',
    name: 'Firewall Center Clamp 82712A Trunk',
    from: 'ecm',
    to: 'clamp_82712A',
    waypoints: [ [-1.2, 0.7, -0.75], [-0.6, 0.73, -1.05], [0.0, 0.72, -1.22] ],
    category: 'grounds',
    radius: 0.045,
    wireColors: ['W', 'B', 'W-B'],
    harnessTag: '82111'
  }
];

export interface FuseData {
  id: string;
  name: string;
  rating: string;
  type: string;
  circuit: string;
  category: SubsystemCategory;
}

export const FUSE_DATA: FuseData[] = [
  { id: 'f_alt', name: 'ALT', rating: '140A', type: 'Fusible Link Bar', circuit: 'Main generator & battery charging line', category: 'power' },
  { id: 'f_eps', name: 'EPS', rating: '80A', type: 'High Current Cartridge', circuit: 'Electric power steering column motor', category: 'power' },
  { id: 'f_abs', name: 'ABS MTR', rating: '50A', type: 'J-Case Cartridge', circuit: 'Skid control hydraulic booster pump', category: 'power' },
  { id: 'f_fan', name: 'FAN NO.1', rating: '30A', type: 'J-Case Cartridge', circuit: 'Brushless radiator cooling fan controller', category: 'cooling' },
  { id: 'f_efi', name: 'EFI-MAIN 1', rating: '25A', type: 'Mini Blade', circuit: 'Powertrain ECU main relay & direct injectors', category: 'ignition' },
  { id: 'f_ign', name: 'IGN', rating: '10A', type: 'Mini Blade', circuit: '4 COP ignition coils +B primary feed', category: 'ignition' },
  { id: 'f_etcs', name: 'ETCS', rating: '10A', type: 'Mini Blade', circuit: 'Electronic throttle H-bridge servo driver', category: 'etcs' },
  { id: 'f_kam', name: 'EFI-MAIN 4', rating: '10A', type: 'Mini Blade', circuit: 'ECM Pin 1A continuous Keep-Alive Memory', category: 'power' }
];

export interface DiagnosticFault {
  code: string;
  title: string;
  subsystem: SubsystemCategory;
  affectedNodeId: string;
  affectedPin: string;
  symptom: string;
  rootCause: string;
  faultType: 'open_circuit' | 'short_ground' | 'high_resistance' | 'bus_timeout' | 'emi_noise';
  anomalousVoltage: string;
  scopeBehavior: string;
  steps: string[];
}

export const DIAGNOSTIC_FAULTS: DiagnosticFault[] = [
  {
    code: 'P0301',
    title: 'Cylinder 1 Misfire Detected (IGT1 Open)',
    subsystem: 'ignition',
    affectedNodeId: 'coils_pack',
    affectedPin: 'Pin 3',
    symptom: 'Rough idle, check engine light flashing, engine shaking, loss of power.',
    rootCause: 'Open circuit in Red wire (IGT1) between ECM Pin 24A and Coil 1 connector Pin 3.',
    faultType: 'open_circuit',
    anomalousVoltage: '0.00 VDC (No trigger pulse)',
    scopeBehavior: 'Flatline 0V. Normal 5V TTL pulse is completely missing.',
    steps: [
      '1. Connect digital oscilloscope to Coil 1 Pin 3 (IGT1). Crank engine.',
      '2. Verify absence of 5V trigger pulse while cylinders 2, 3, 4 show normal 5.0V pulses.',
      '3. Disconnect ECM connector A24 and Coil 1 connector. Test continuity from Pin 24A to Pin 3.',
      '4. Measured resistance is > 10 kΩ (Open wire in harness branch). Repair chafed Red wire.'
    ]
  },
  {
    code: 'P0122',
    title: 'Throttle Position Sensor \'A\' Circuit Low (5V VCTA Lost)',
    subsystem: 'etcs',
    affectedNodeId: 'throttle_etcs',
    affectedPin: 'Pin 3',
    symptom: 'Vehicle enters limp-home mode, throttle does not respond past 2000 RPM.',
    rootCause: 'Broken Blue wire supplying regulated 5.0V reference (VCTA) to throttle body Hall sensors.',
    faultType: 'open_circuit',
    anomalousVoltage: '0.04 VDC (Lost reference)',
    scopeBehavior: '0V flatline instead of constant 5.01V regulated reference level.',
    steps: [
      '1. Check live scan data for TPS VTA1. Value is pegged at 0.08V (failsafe threshold).',
      '2. Back-probe Pin 3 (VCTA) with DMM. Measured 0.04V instead of 5.00V.',
      '3. Test voltage directly at ECM output pin to rule out internal 5V regulator failure.',
      '4. Pinpoint open in Blue wire between ECM and throttle connector T1.'
    ]
  },
  {
    code: 'P0625',
    title: 'Generator Field / Alternator LIN Bus Timeout',
    subsystem: 'power',
    affectedNodeId: 'alternator',
    affectedPin: 'LIN',
    symptom: 'Battery charge warning light illuminated; alternator charging at fixed default 13.8V.',
    rootCause: 'Intermittent open or ground short on Violet wire (LIN Bus) to smart alternator.',
    faultType: 'bus_timeout',
    anomalousVoltage: '0.00 VDC (Grounded bus)',
    scopeBehavior: 'Absence of 19.2 kbaud UART digital message packets; scope line tied low.',
    steps: [
      '1. Connect scope to LIN terminal (Violet wire).',
      '2. Note lack of 12V recessive baseline and dynamic data packet bursts.',
      '3. Inspect harness section near exhaust manifold where wire insulation was heat-damaged.',
      '4. Restore LIN circuit integrity; observe immediate resumption of ECM battery PID telemetry.'
    ]
  },
  {
    code: 'P0480',
    title: 'Cooling Fan 1 Control Circuit Malfunction',
    subsystem: 'cooling',
    affectedNodeId: 'fan',
    affectedPin: 'Pin 3',
    symptom: 'Engine temperature rises when idling in traffic; A/C compressor cuts out.',
    rootCause: 'Disconnection in Light Green wire carrying 100 Hz PWM command (RFC) from ECM Pin 60A.',
    faultType: 'open_circuit',
    anomalousVoltage: '0.00 VDC',
    scopeBehavior: 'Missing 100 Hz square wave duty cycle; fan controller fails to activate.',
    steps: [
      '1. Command fan ON with diagnostic bi-directional scan tool.',
      '2. Probe Pin 3 at fan connector with frequency counter and oscilloscope.',
      '3. Observe 0 Hz and 0% duty cycle despite ECM commanding 85% duty.',
      '4. Locate connector pin fretting / loose terminal lock at connector bracket.'
    ]
  },
  {
    code: 'P0325',
    title: 'Knock Sensor 1 Circuit Malfunction (Shield Open)',
    subsystem: 'grounds',
    affectedNodeId: 'knock_sensor',
    affectedPin: 'Shield',
    symptom: 'Hesitation under acceleration, engine timing overly retarded, increased fuel consumption.',
    rootCause: 'Ground drain eyelet at Cylinder Head Stud EC detached or corroded; coaxial shield floating.',
    faultType: 'emi_noise',
    anomalousVoltage: '1.8 Vpp Noise (Induced EMI)',
    scopeBehavior: 'Knock signal trace heavily corrupted by spark ignition inductive spikes.',
    steps: [
      '1. Observe raw knock sensor channel on DSO. High ignition noise spikes synchronized with firing.',
      '2. Inspect Ground Stud EC on the rear cylinder head.',
      '3. Clean oxidation on M8 eyelet and torque bolt to 12 Nm.',
      '4. Verify clean acoustic waveform returns with baseline < 50mV noise.'
    ]
  },
  {
    code: 'P0685',
    title: 'EFI Power Relay Short to Ground (Blown 25A Fuse)',
    subsystem: 'power',
    affectedNodeId: 'fusebox',
    affectedPin: 'EFI-25A',
    symptom: 'Immediate engine stall; cranks but will not start; no communication with ECM.',
    rootCause: 'Harness pinched against engine mount bolt; Black/Red wire dead shorted to metal chassis.',
    faultType: 'short_ground',
    anomalousVoltage: '0.00 VDC (Blown fuse)',
    scopeBehavior: '0V flatline; fuse element open; heavy spark arc simulated at point of contact.',
    steps: [
      '1. Measure voltage across EFI-MAIN 1 fuse blades. Input shows 12.6V, load terminal shows 0.0V.',
      '2. Remove fuse and test load terminal with Ohmmeter to battery ground: measured 0.02Ω dead short.',
      '3. Trace Black/Red harness branch over driver-side mount.',
      '4. Relocate harness away from pinch point, insulate wire with dual-wall heat-shrink, replace fuse.'
    ]
  },
  {
    code: 'P0118',
    title: 'Ground Stud EC Voltage Drop (Corroded Cylinder Head Lug)',
    subsystem: 'grounds',
    affectedNodeId: 'ground_ec',
    affectedPin: 'Lug 1',
    symptom: 'Erratic idle, cylinder misfires at high load, sensor voltage drift on oscilloscope.',
    rootCause: 'Severe galvanic oxidation on M8 brass eyelet lug; ground resistance measured at 4.8Ω.',
    faultType: 'high_resistance',
    anomalousVoltage: '1.45 VDC Ground Drop (Elevated Ground Offset)',
    scopeBehavior: 'Ground plane elevated from 0.0V to +1.45V with severe inductive ringing spikes.',
    steps: [
      '1. Connect DMM black lead to Battery (-) and red lead to Engine Head Stud EC.',
      '2. Crank engine / rev throttle. Measure voltage drop. Healthy is < 0.05V; measured is 1.45V.',
      '3. Back-probe coil ground pins: observe elevated baseline distorting primary ionization.',
      '4. Remove M8 bolt, wire-brush cylinder head aluminum boss to bare metal, apply dielectric grease, torque to 12 Nm.'
    ]
  },
  {
    code: 'P2101',
    title: 'Throttle Actuator Motor M+ Short Circuit',
    subsystem: 'etcs',
    affectedNodeId: 'throttle_etcs',
    affectedPin: 'Pin 1',
    symptom: 'Check engine light on, electronic throttle stuck closed in mechanical limp position (7%).',
    rootCause: 'Motor command wire M+ shorted internally to throttle valve casing.',
    faultType: 'short_ground',
    anomalousVoltage: '0.12 VDC (Driver protection clamp)',
    scopeBehavior: 'High current shutdown waveform; ECM H-Bridge disables PWM drive pulse train.',
    steps: [
      '1. Inspect ETCS fuse 10A in Junction Block No. 1.',
      '2. Disconnect T1 connector; test motor coil resistance between Pin 1 (M+) and Pin 2 (M-). Nominal: 2.1Ω. Measured: 0.1Ω.',
      '3. Scope Pin 1 during key-on cycle; observe ECM driver foldback protection clamp.',
      '4. Replace motorized throttle body assembly and recalibrate zero-throttle learned values.'
    ]
  },
  {
    code: 'P0350',
    title: 'Blown IGN 10A Fuse (Total Ignition Failure)',
    subsystem: 'ignition',
    affectedNodeId: 'fusebox',
    affectedPin: 'IGN-10A',
    symptom: 'Engine dies instantly; starter cranks briskly but engine will not fire on any cylinder.',
    rootCause: 'Intermittent short in coil harness harness against exhaust manifold heat shield.',
    faultType: 'open_circuit',
    anomalousVoltage: '0.00 VDC on all 4 Ignition Coils',
    scopeBehavior: 'Zero volts on Pin 1 across all 4 COP connectors; IGT pulses present but no spark generated.',
    steps: [
      '1. Verify +12V power at Coil 1 Pin 1 with ignition key ON. Measured 0.0V.',
      '2. Inspect fuse IGN 10A in under-hood fuse block; fuse link element is visibly melted/open.',
      '3. Measure harness side to ground before installing new fuse to prevent immediate re-blow.',
      '4. Insulate chafed wiring near heat shield and install new 10A mini blade fuse.'
    ]
  }
];
