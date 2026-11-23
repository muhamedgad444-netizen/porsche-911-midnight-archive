import { ChassisId, ChassisSpec } from '../types';

export const FLEET_SPECS: Record<ChassisId, ChassisSpec> = {
  gt3: {
    id: 'gt3',
    code: 'CHASSIS_01 // 992',
    name: '911 GT3',
    subtitle: 'TRACK_READY // SHARK BLUE',
    year: '2024',
    modelUrl: '/hero_model/porsche_911_gt3_final.ktx2.glb',
    fallbackUrl: '/hero_model/porsche_911_gt3_final.glb',
    accentHex: '#0070FF',
    serial: 'WP0AC2A99PS270992',
    power: '502 HP',
    redline: '9,000 RPM',
    engine: '4.0L Naturally Aspirated Flat-6',
    zeroToHundred: '3.4 s',
    topSpeed: '318 km/h',
    weight: '1,435 kg',
    nurburgring: '6:55.2 min',
    scaleMultiplier: 1.0,
    yOffset: 0,
    notes: 'Swan-neck rear wing, double-wishbone front axle, motorsport-derived six individual throttle bodies.',
  },
  st: {
    id: 'st',
    code: 'CHASSIS_02 // 992',
    name: '911 S/T',
    subtitle: '60TH ANNIVERSARY // FEATHERWEIGHT',
    year: '2024',
    modelUrl: '/gtr_model/porsche_911_st_final.ktx2.glb',
    fallbackUrl: '/gtr_model/porsche_911_st_final.glb',
    accentHex: '#00E5FF',
    serial: 'WP0ZZZ99ZRS261963',
    power: '518 HP',
    redline: '9,000 RPM',
    engine: '4.0L GT3 RS Flat-6 · 6-Speed Manual',
    zeroToHundred: '3.7 s',
    topSpeed: '300 km/h',
    weight: '1,380 kg',
    nurburgring: 'LIMITED 1,963 UNITS',
    scaleMultiplier: 1.0,
    yOffset: 0,
    notes: 'Lightest 992-generation 911 ever built. Carbon-fiber doors, hood, roof, single-mass flywheel.',
  },
  spyder: {
    id: 'spyder',
    code: 'CHASSIS_03 // 918',
    name: '918 SPYDER',
    subtitle: 'WEISSACH HYPER-HYBRID',
    year: '2015',
    modelUrl: '/steeringwheel_model/porsche_918_spyder_final.ktx2.glb',
    fallbackUrl: '/steeringwheel_model/porsche_918_spyder_final.glb',
    accentHex: '#38BDF8',
    serial: 'WP0CA2A1XFS800918',
    power: '887 HP',
    redline: '9,150 RPM',
    engine: '4.6L V8 + Dual Electric Motors',
    zeroToHundred: '2.6 s',
    topSpeed: '345 km/h',
    weight: '1,634 kg',
    nurburgring: '6:57.0 min',
    scaleMultiplier: 1.0,
    yOffset: 0,
    notes: 'Carbon monocoque chassis, top-pipe exhaust architecture, active Weissach aerodynamic channels.',
  },
};

export const FLEET_ORDER: ChassisId[] = ['gt3', 'st', 'spyder'];

export interface FilmFeed {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  telemetry: string;
  src: string;
}

export const FILM_FEEDS: FilmFeed[] = [
  {
    id: 'midnight-run',
    tag: 'CAM_01 // LIVE_FEED',
    title: 'STUTTGART MIDNIGHT RUN',
    subtitle: '992 GT3 AERODYNAMIC CAPTURE // 60 FPS RAW',
    telemetry: 'LAT 48.8342° N · LON 9.1520° E · 9,000 RPM',
    src: '/videoplayback.1774746221814.publer.com.mp4',
  },
  {
    id: 'weissach-lab',
    tag: 'CAM_02 // AERO_LAB',
    title: 'WEISSACH NIGHT TELEMETRY',
    subtitle: 'WIND TUNNEL & CARBON CHASSIS ARCHIVE',
    telemetry: 'DOWNFORCE 385 KG @ 200 KM/H · DRS ACTIVE',
    src: '/videoplayback.1774746445747.publer.com.mp4',
  },
];
