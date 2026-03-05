import axios from 'axios';

interface DrugInteraction {
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  drugs: string[];
}

interface MedicationInfo {
  name: string;
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  warnings?: string[];
  indications?: string[];
  adverseReactions?: string[];
  dosageAndAdministration?: string;
}

class DrugInteractionService {
  private openFDABaseURL = 'https://api.fda.gov/drug';

  /**
   * Check for drug interactions between multiple medications
   */
  async checkInteractions(medications: string[]): Promise<DrugInteraction[]> {
    try {
      const interactions: DrugInteraction[] = [];

      // Simple interaction checking logic
      // In a real-world scenario, you'd use a comprehensive drug interaction database
      
      // Check each pair of medications
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const drug1 = medications[i].toLowerCase();
          const drug2 = medications[j].toLowerCase();

          // Example: Check for known interactions (this is simplified)
          const knownInteraction = this.checkKnownInteraction(drug1, drug2);
          
          if (knownInteraction) {
            interactions.push(knownInteraction);
          }
        }
      }

      // If no interactions found
      if (interactions.length === 0) {
        console.log('No known interactions found between the provided medications');
      }

      return interactions;
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      throw new Error('Failed to check drug interactions');
    }
  }

  /**
   * Check for known interactions between two drugs
   * This is a simplified example - in production, use a comprehensive database
   */
  private checkKnownInteraction(drug1: string, drug2: string): DrugInteraction | null {
    // Common drug interaction examples (simplified)
    const knownInteractions: { [key: string]: DrugInteraction } = {
      'warfarin-aspirin': {
        severity: 'major',
        description: 'Increased risk of bleeding when warfarin is combined with aspirin',
        drugs: ['warfarin', 'aspirin'],
      },
      'aspirin-ibuprofen': {
        severity: 'moderate',
        description: 'Combining NSAIDs may increase risk of gastrointestinal bleeding',
        drugs: ['aspirin', 'ibuprofen'],
      },
      'metformin-alcohol': {
        severity: 'moderate',
        description: 'Alcohol may increase the risk of lactic acidosis with metformin',
        drugs: ['metformin', 'alcohol'],
      },
      'simvastatin-amlodipine': {
        severity: 'moderate',
        description: 'Amlodipine may increase simvastatin levels, increasing risk of side effects',
        drugs: ['simvastatin', 'amlodipine'],
      },
    };

    // Check both orderings
    const key1 = `${drug1}-${drug2}`;
    const key2 = `${drug2}-${drug1}`;

    return knownInteractions[key1] || knownInteractions[key2] || null;
  }

  /**
   * Get medication information from OpenFDA API
   */
  async getMedicationInfo(medicationName: string): Promise<MedicationInfo | null> {
    try {
      const searchQuery = encodeURIComponent(medicationName);
      const url = `${this.openFDABaseURL}/label.json?search=openfda.brand_name:"${searchQuery}"&limit=1`;

      console.log(`Fetching medication info from OpenFDA: ${medicationName}`);

      const response = await axios.get(url, {
        timeout: 10000,
      });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        console.log(`No information found for: ${medicationName}`);
        return null;
      }

      const result = response.data.results[0];

      const medicationInfo: MedicationInfo = {
        name: medicationName,
        genericName: result.openfda?.generic_name?.[0],
        brandName: result.openfda?.brand_name?.[0],
        manufacturer: result.openfda?.manufacturer_name?.[0],
        warnings: result.warnings || result.boxed_warning || [],
        indications: result.indications_and_usage ? [result.indications_and_usage] : [],
        adverseReactions: result.adverse_reactions ? [result.adverse_reactions] : [],
        dosageAndAdministration: result.dosage_and_administration,
      };

      return medicationInfo;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`Medication not found in OpenFDA: ${medicationName}`);
        return null;
      }

      console.error('Error fetching medication info from OpenFDA:', error.message);
      // Don't throw error, return null to allow graceful degradation
      return null;
    }
  }

  /**
   * Analyze prescription for potential issues
   */
  async analyzePrescription(medications: Array<{ name: string; dosage?: string }>): Promise<{
    interactions: DrugInteraction[];
    warnings: string[];
  }> {
    const medicationNames = medications.map((med) => med.name);
    const interactions = await this.checkInteractions(medicationNames);

    const warnings: string[] = [];

    // Check each medication for warnings
    for (const medication of medications) {
      const info = await this.getMedicationInfo(medication.name);
      
      if (info && info.warnings && info.warnings.length > 0) {
        warnings.push(`${medication.name}: ${info.warnings[0]}`);
      }
    }

    return {
      interactions,
      warnings,
    };
  }

  /**
   * Check if medication requires prescription
   */
  isControlledSubstance(medicationName: string): boolean {
    // Common controlled substances (simplified list)
    const controlledSubstances = [
      'morphine',
      'codeine',
      'oxycodone',
      'hydrocodone',
      'fentanyl',
      'alprazolam',
      'diazepam',
      'lorazepam',
      'amphetamine',
      'methylphenidate',
    ];

    const lowerName = medicationName.toLowerCase();
    return controlledSubstances.some((substance) => lowerName.includes(substance));
  }
}

export const drugInteractionService = new DrugInteractionService();
export default drugInteractionService;
