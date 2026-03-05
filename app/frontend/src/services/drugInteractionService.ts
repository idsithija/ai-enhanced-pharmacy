import api from './api';
import type { ApiResponse } from '../types';

export interface DrugInteraction {
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  drugs: string[];
}

export interface InteractionResult {
  interactions: DrugInteraction[];
  hasInteraction: boolean;
  checked: boolean;
}

export interface MedicationInfo {
  name: string;
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  warnings?: string[];
  indications?: string[];
  adverseReactions?: string[];
  dosageAndAdministration?: string;
}

export const drugInteractionService = {
  /**
   * Check interactions for multiple drugs
   */
  checkInteractions: async (medications: string[]): Promise<InteractionResult> => {
    try {
      const response = await api.post<ApiResponse<{ interactions: DrugInteraction[] }>>('/ai/drug-interactions', {
        medications,
      });
      
      const interactions = response.data.data.interactions || [];
      
      return {
        interactions,
        hasInteraction: interactions.length > 0,
        checked: true,
      };
    } catch (error: any) {
      console.error('Error checking drug interactions:', error);
      // Return safe result on error
      return {
        interactions: [],
        hasInteraction: false,
        checked: false,
      };
    }
  },

  /**
   * Get detailed drug information from OpenFDA
   */
  getMedicationInfo: async (medicationName: string): Promise<MedicationInfo | null> => {
    try {
      const response = await api.get<ApiResponse<MedicationInfo>>(`/ai/medication-info/${encodeURIComponent(medicationName)}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting medication info:', error);
      return null;
    }
  },

  /**
   * Analyze prescription for interactions and warnings
   */
  analyzePrescription: async (medications: Array<{ name: string; dosage?: string }>): Promise<{
    interactions: DrugInteraction[];
    warnings: string[];
  }> => {
    try {
      const medicationNames = medications.map(m => m.name);
      const result = await drugInteractionService.checkInteractions(medicationNames);
      
      // Get warnings for each medication
      const warnings: string[] = [];
      for (const med of medications) {
        const info = await drugInteractionService.getMedicationInfo(med.name);
        if (info && info.warnings && info.warnings.length > 0) {
          warnings.push(`${med.name}: ${info.warnings[0].substring(0, 200)}...`);
        }
      }
      
      return {
        interactions: result.interactions,
        warnings,
      };
    } catch (error: any) {
      console.error('Error analyzing prescription:', error);
      return {
        interactions: [],
        warnings: [],
      };
    }
  },
};

