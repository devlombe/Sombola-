
import type { DiseaseInfo } from '../types';

class DiseaseService {
  private diseaseInfoMap: Map<string, DiseaseInfo> = new Map();
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    try {
      const response = await fetch('/model/disease_info_by_label.json');
      if (!response.ok) {
        throw new Error('Failed to load disease info');
      }
      const data: Record<string, DiseaseInfo> = await response.json();
      for (const key in data) {
        this.diseaseInfoMap.set(key, data[key]);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing DiseaseService:", error);
      this.isInitialized = false;
    }
  }

  public getDiseaseInfo(label: string): DiseaseInfo | undefined {
    // Robust lookup: trim and match case-insensitive
    const trimmedLabel = label.trim();
    let info = this.diseaseInfoMap.get(trimmedLabel);
    if (!info) {
      // Try case-insensitive match
      for (const key of this.diseaseInfoMap.keys()) {
        if (key.trim().toLowerCase() === trimmedLabel.toLowerCase()) {
          info = this.diseaseInfoMap.get(key);
          break;
        }
      }
    }
    return info;
  }

  public getAllDiseases(): DiseaseInfo[] {
    return Array.from(this.diseaseInfoMap.values());
  }
  
  public getSupportedPlantTypes(): string[] {
    const plantTypes = new Set<string>();
    this.diseaseInfoMap.forEach((_, key) => {
      plantTypes.add(key.split('___')[0]);
    });
    return Array.from(plantTypes);
  }

  public getDiseasesByPlantType(plantType: string): DiseaseInfo[] {
    const diseases: DiseaseInfo[] = [];
    this.diseaseInfoMap.forEach((info, key) => {
      if (key.startsWith(plantType)) {
        diseases.push(info);
      }
    });
    return diseases;
  }
}

const diseaseService = new DiseaseService();
export default diseaseService;
