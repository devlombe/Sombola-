
export type Screen = 'home' | 'camera' | 'gallery' | 'result' | 'history' | 'guide';

export interface SeverityGuide {
  mild: string;
  moderate: string;
  severe: string;
}

export interface DiseaseInfo {
  technical_name?: string;
  farmer_name: string;
  simple_description: string;
  what_farmer_sees: string[];
  immediate_action?: string[];
  treatment?: string[];
  prevention_tips?: string[];
  severity_guide?: SeverityGuide;
  when_to_worry?: string;
}

export interface PredictionResult {
  label: string;
  confidence: number;
  diseaseInfo: DiseaseInfo;
  timestamp: number;
  imagePath: string;
  plantType: string;
  plantName?: string; // Crop name for analysis display
  isHealthy: boolean;
  confidencePercentage: string;
  severityLevel: SeverityLevel;
}

export enum SeverityLevel {
  Healthy = 'Healthy',
  Mild = 'Mild',
  Moderate = 'Moderate',
  Severe = 'Severe',
  Unknown = 'Unknown'
}
