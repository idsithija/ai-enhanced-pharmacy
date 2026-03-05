// NLP Service for Advanced Prescription Analysis
// Using Natural.js for text processing and pattern matching

interface MedicineExtracted {
  name: string;
  dosage: string;
  form?: string; // tablet, capsule, syrup, etc.
  frequency: string;
  duration?: string;
  instructions?: string;
  timing?: string; // before/after food, morning/evening
}

interface PrescriptionAnalysis {
  success: boolean;
  doctorName?: string;
  doctorSpecialization?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  prescriptionDate?: string;
  medicines: MedicineExtracted[];
  diagnosis?: string;
  notes?: string;
  followUp?: string;
}

class NLPService {
  // Medicine form patterns
  private medicineFormPatterns = [
    { pattern: /\b(tab|tablet|tablets)\b/gi, form: 'tablet' },
    { pattern: /\b(cap|capsule|capsules)\b/gi, form: 'capsule' },
    { pattern: /\b(syp|syrup|syrups)\b/gi, form: 'syrup' },
    { pattern: /\b(inj|injection|injections)\b/gi, form: 'injection' },
    { pattern: /\b(drop|drops)\b/gi, form: 'drops' },
    { pattern: /\b(cream|ointment|gel)\b/gi, form: 'topical' },
  ];

  // Frequency patterns
  private frequencyPatterns: Record<string, { times: number; period: string; description: string }> = {
    'once daily': { times: 1, period: 'day', description: 'Once daily' },
    'twice daily': { times: 2, period: 'day', description: 'Twice daily' },
    'thrice daily': { times: 3, period: 'day', description: 'Three times daily' },
    'once a day': { times: 1, period: 'day', description: 'Once daily' },
    'twice a day': { times: 2, period: 'day', description: 'Twice daily' },
    'three times a day': { times: 3, period: 'day', description: 'Three times daily' },
    'four times a day': { times: 4, period: 'day', description: 'Four times daily' },
    'od': { times: 1, period: 'day', description: 'Once daily (OD)' },
    'bd': { times: 2, period: 'day', description: 'Twice daily (BD)' },
    'tid': { times: 3, period: 'day', description: 'Three times daily (TID)' },
    'qid': { times: 4, period: 'day', description: 'Four times daily (QID)' },
    'q8h': { times: 3, period: 'day', description: 'Every 8 hours' },
    'q12h': { times: 2, period: 'day', description: 'Every 12 hours' },
    'qd': { times: 1, period: 'day', description: 'Once daily (QD)' },
    'prn': { times: 0, period: 'as needed', description: 'As needed (PRN)' },
    'sos': { times: 0, period: 'as needed', description: 'If necessary (SOS)' },
  };

  // Timing patterns
  private timingPatterns = [
    { pattern: /\b(before (food|meal|breakfast|lunch|dinner))\b/gi, timing: 'before food' },
    { pattern: /\b(after (food|meal|breakfast|lunch|dinner))\b/gi, timing: 'after food' },
    { pattern: /\b(with (food|meal))\b/gi, timing: 'with food' },
    { pattern: /\b(on empty stomach)\b/gi, timing: 'empty stomach' },
    { pattern: /\b(at bedtime|before sleep|hs)\b/gi, timing: 'bedtime' },
    { pattern: /\b(in the morning|morning)\b/gi, timing: 'morning' },
    { pattern: /\b(in the evening|evening)\b/gi, timing: 'evening' },
  ];

  /**
   * Analyze prescription text and extract structured information
   */
  public analyzePrescription(text: string): PrescriptionAnalysis {
    const lines = text.split('\n').filter(line => line.trim());
    
    const analysis: PrescriptionAnalysis = {
      success: true,
      medicines: [],
    };

    // Extract doctor information
    analysis.doctorName = this.extractDoctorName(text);
    analysis.doctorSpecialization = this.extractDoctorSpecialization(text);

    // Extract patient information
    analysis.patientName = this.extractPatientName(text);
    analysis.patientAge = this.extractPatientAge(text);
    analysis.patientGender = this.extractPatientGender(text);

    // Extract prescription date
    analysis.prescriptionDate = this.extractDate(text);

    // Extract diagnosis
    analysis.diagnosis = this.extractDiagnosis(text);

    // Extract medicines
    analysis.medicines = this.extractMedicines(lines);

    // Extract notes and follow-up
    analysis.notes = this.extractNotes(text);
    analysis.followUp = this.extractFollowUp(text);

    return analysis;
  }

  /**
   * Extract doctor name from text
   */
  private extractDoctorName(text: string): string | undefined {
    const patterns = [
      /(?:Dr\.?|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Physician:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Prescribed by:\s*Dr\.?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return undefined;
  }

  /**
   * Extract doctor specialization
   */
  private extractDoctorSpecialization(text: string): string | undefined {
    const patterns = [
      /(?:MD|MBBS|MS)\s*[\(\-]\s*([A-Za-z\s]+)[\)\-]/i,
      /Specialist:\s*([A-Za-z\s]+)/i,
      /Specialization:\s*([A-Za-z\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return undefined;
  }

  /**
   * Extract patient name from text
   */
  private extractPatientName(text: string): string | undefined {
    const patterns = [
      /Patient:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Patient Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Mr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Mrs\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /Ms\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return undefined;
  }

  /**
   * Extract patient age
   */
  private extractPatientAge(text: string): string | undefined {
    const patterns = [
      /Age:\s*(\d+)\s*(?:years?|yrs?|y)?/i,
      /(\d+)\s*(?:years?|yrs?)\s*(?:old)?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1] + ' years';
    }

    return undefined;
  }

  /**
   * Extract patient gender
   */
  private extractPatientGender(text: string): string | undefined {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('male') && !lowerText.includes('female')) return 'Male';
    if (lowerText.includes('female')) return 'Female';
    if (lowerText.includes('mr.') || lowerText.includes('mr ')) return 'Male';
    if (lowerText.includes('mrs.') || lowerText.includes('ms.')) return 'Female';

    return undefined;
  }

  /**
   * Extract date from prescription
   */
  private extractDate(text: string): string | undefined {
    const patterns = [
      /Date:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }

  /**
   * Extract diagnosis
   */
  private extractDiagnosis(text: string): string | undefined {
    const patterns = [
      /Diagnosis:\s*([^\n]+)/i,
      /Dx:\s*([^\n]+)/i,
      /Complaint:\s*([^\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return undefined;
  }

  /**
   * Extract medicines from prescription lines
   */
  private extractMedicines(lines: string[]): MedicineExtracted[] {
    const medicines: MedicineExtracted[] = [];
    let currentMedicine: Partial<MedicineExtracted> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || this.isHeaderLine(line)) continue;

      // Check if line contains medicine pattern
      const medicineMatch = this.extractMedicineFromLine(line, lines, i);
      
      if (medicineMatch) {
        if (currentMedicine && currentMedicine.name) {
          medicines.push(currentMedicine as MedicineExtracted);
        }
        currentMedicine = medicineMatch;
      } else if (currentMedicine) {
        // Check if this line contains additional instructions for current medicine
        const additionalInfo = this.extractAdditionalInfo(line);
        if (additionalInfo.frequency && !currentMedicine.frequency) {
          currentMedicine.frequency = additionalInfo.frequency;
        }
        if (additionalInfo.timing && !currentMedicine.timing) {
          currentMedicine.timing = additionalInfo.timing;
        }
        if (additionalInfo.duration && !currentMedicine.duration) {
          currentMedicine.duration = additionalInfo.duration;
        }
      }
    }

    // Add last medicine
    if (currentMedicine && currentMedicine.name) {
      medicines.push(currentMedicine as MedicineExtracted);
    }

    return medicines;
  }

  /**
   * Check if line is a header (not medicine data)
   */
  private isHeaderLine(line: string): boolean {
    const headerPatterns = [
      /^(prescription|rx|medications?|treatment)/i,
      /^(doctor|patient|date|diagnosis)/i,
      /^(name|age|gender|address)/i,
    ];

    return headerPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Extract medicine information from a line
   */
  private extractMedicineFromLine(line: string, lines: string[], index: number): Partial<MedicineExtracted> | null {
    // Pattern: Medicine name + dosage + form
    // Example: "Tab. Paracetamol 500mg" or "Paracetamol 500mg BD"
    
    const medicinePattern = /(?:Tab\.?|Cap\.?|Syp\.?|Inj\.?)?\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(\d+\s*(?:mg|ml|g|mcg|%)?)/i;
    const match = line.match(medicinePattern);

    if (!match) return null;

    const medicine: Partial<MedicineExtracted> = {
      name: match[1].trim(),
      dosage: match[2].trim(),
      instructions: line,
    };

    // Extract form
    for (const { pattern, form } of this.medicineFormPatterns) {
      if (pattern.test(line)) {
        medicine.form = form;
        break;
      }
    }

    // Extract frequency
    const frequencyInfo = this.extractFrequency(line);
    if (frequencyInfo) {
      medicine.frequency = frequencyInfo;
    }

    // Extract timing
    const timingInfo = this.extractTiming(line);
    if (timingInfo) {
      medicine.timing = timingInfo;
    }

    // Extract duration
    const durationInfo = this.extractDuration(line, lines, index);
    if (durationInfo) {
      medicine.duration = durationInfo;
    }

    return medicine;
  }

  /**
   * Extract frequency from line
   */
  private extractFrequency(line: string): string | undefined {
    const lowerLine = line.toLowerCase();

    for (const [pattern, info] of Object.entries(this.frequencyPatterns)) {
      if (lowerLine.includes(pattern)) {
        return info.description;
      }
    }

    // Pattern: 1-0-1, 1-1-1, etc.
    const numericPattern = /(\d+)-(\d+)-(\d+)/;
    const match = line.match(numericPattern);
    if (match) {
      const morning = parseInt(match[1]);
      const afternoon = parseInt(match[2]);
      const evening = parseInt(match[3]);
      const total = morning + afternoon + evening;
      
      if (total > 0) {
        return `${morning} morning, ${afternoon} afternoon, ${evening} evening`;
      }
    }

    return undefined;
  }

  /**
   * Extract timing information
   */
  private extractTiming(line: string): string | undefined {
    for (const { pattern, timing } of this.timingPatterns) {
      if (pattern.test(line)) {
        return timing;
      }
    }

    return undefined;
  }

  /**
   * Extract duration
   */
  private extractDuration(line: string, lines: string[], index: number): string | undefined {
    // Check current line and next line
    const contextLines = [line, lines[index + 1] || ''].join(' ');
    
    const durationPattern = /(?:for|x)\s*(\d+)\s*(day|days|week|weeks|month|months)/i;
    const match = contextLines.match(durationPattern);

    if (match) {
      return `${match[1]} ${match[2]}`;
    }

    return undefined;
  }

  /**
   * Extract additional information from continuation lines
   */
  private extractAdditionalInfo(line: string): Partial<MedicineExtracted> {
    return {
      frequency: this.extractFrequency(line),
      timing: this.extractTiming(line),
      duration: this.extractDuration(line, [line], 0),
    };
  }

  /**
   * Extract notes from prescription
   */
  private extractNotes(text: string): string | undefined {
    const patterns = [
      /Notes?:\s*([^\n]+)/i,
      /Advice:\s*([^\n]+)/i,
      /Instructions?:\s*([^\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return undefined;
  }

  /**
   * Extract follow-up information
   */
  private extractFollowUp(text: string): string | undefined {
    const patterns = [
      /Follow[- ]?up:\s*([^\n]+)/i,
      /Next visit:\s*([^\n]+)/i,
      /Review after:\s*([^\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return undefined;
  }
}

// Export singleton instance
export const nlpService = new NLPService();
