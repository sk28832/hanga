export type Pigment = {
  romaji: string;
  kanji: string;
  english: string;
  note: string;
};

export type Bokashi = {
  type: string;
  orientation: string;
  angle_deg: number;
  linearity: number;
  spread: number;
  from_hex: string;
  to_hex: string;
};

export type ColorBlock = {
  id: number;
  sequence: number;
  role: string;
  hex: string;
  rgb: number[];
  area_fraction: number;
  pigment: Pigment;
  bokashi: Bokashi | null;
  registration_offset: [number, number];
  centroid: [number, number];
  image: string;
};

export type DeconstructPlan = {
  meta: {
    width: number;
    height: number;
    n_blocks: number;
    engine_version: string;
    used_sam: boolean;
  };
  base: { hex: string; pigment: Pigment };
  keyblock: {
    sequence: number;
    role: string;
    name: string;
    pigment: Pigment;
    image: string;
  };
  kento: {
    kagi: { x: number; y: number; note: string };
    hikitsuke: { x: number; y: number; note: string };
    explanation: string;
    order?: number[];
  };
  original: string;
  final: string;
  blocks: ColorBlock[];
  sample?: {
    slug: string;
    title: string;
    series?: string;
    year?: string;
    note?: string;
  };
};

export type SampleEntry = {
  slug: string;
  title: string;
  series: string;
  year: string;
  thumb: string;
  plan: string;
};
