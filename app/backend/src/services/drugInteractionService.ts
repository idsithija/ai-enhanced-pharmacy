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

// ─── Drug class definitions ───
// Maps a class name to all drugs that belong to it
const drugClasses: Record<string, string[]> = {
  nsaid: ['ibuprofen', 'naproxen', 'diclofenac', 'celecoxib', 'meloxicam', 'piroxicam', 'indomethacin', 'ketorolac', 'mefenamic acid', 'aspirin'],
  ssri: ['fluoxetine', 'sertraline', 'paroxetine', 'citalopram', 'escitalopram', 'fluvoxamine'],
  snri: ['venlafaxine', 'duloxetine', 'desvenlafaxine'],
  statin: ['atorvastatin', 'simvastatin', 'rosuvastatin', 'lovastatin', 'pravastatin', 'fluvastatin', 'pitavastatin'],
  ace_inhibitor: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'benazepril', 'fosinopril', 'perindopril', 'quinapril', 'trandolapril'],
  arb: ['losartan', 'valsartan', 'irbesartan', 'candesartan', 'olmesartan', 'telmisartan', 'azilsartan'],
  anticoagulant: ['warfarin', 'heparin', 'enoxaparin', 'rivaroxaban', 'apixaban', 'dabigatran', 'edoxaban'],
  antiplatelet: ['clopidogrel', 'ticagrelor', 'prasugrel', 'aspirin', 'dipyridamole'],
  benzodiazepine: ['diazepam', 'lorazepam', 'alprazolam', 'clonazepam', 'midazolam', 'temazepam', 'oxazepam'],
  opioid: ['morphine', 'codeine', 'oxycodone', 'hydrocodone', 'fentanyl', 'tramadol', 'methadone', 'buprenorphine', 'tapentadol'],
  macrolide: ['erythromycin', 'clarithromycin', 'azithromycin'],
  fluoroquinolone: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'ofloxacin', 'norfloxacin'],
  ppi: ['omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole'],
  calcium_channel_blocker: ['amlodipine', 'nifedipine', 'diltiazem', 'verapamil', 'felodipine'],
  beta_blocker: ['metoprolol', 'atenolol', 'propranolol', 'carvedilol', 'bisoprolol', 'nebivolol', 'labetalol'],
  potassium_sparing_diuretic: ['spironolactone', 'eplerenone', 'amiloride', 'triamterene'],
  tricyclic_antidepressant: ['amitriptyline', 'nortriptyline', 'imipramine', 'desipramine', 'doxepin', 'clomipramine'],
  maoi: ['phenelzine', 'tranylcypromine', 'selegiline', 'isocarboxazid'],
  sulfonylurea: ['glipizide', 'glyburide', 'glimepiride'],
  thyroid_hormone: ['levothyroxine', 'liothyronine'],
};

// ─── Drug aliases (brand names → generic, alternate spellings) ───
const drugAliases: Record<string, string> = {
  // Common brand → generic mappings
  'tylenol': 'acetaminophen', 'paracetamol': 'acetaminophen', 'panadol': 'acetaminophen',
  'advil': 'ibuprofen', 'motrin': 'ibuprofen', 'nurofen': 'ibuprofen',
  'aleve': 'naproxen', 'naprosyn': 'naproxen',
  'coumadin': 'warfarin', 'jantoven': 'warfarin',
  'lipitor': 'atorvastatin',
  'zocor': 'simvastatin',
  'crestor': 'rosuvastatin',
  'plavix': 'clopidogrel',
  'nexium': 'esomeprazole',
  'prilosec': 'omeprazole',
  'zoloft': 'sertraline',
  'prozac': 'fluoxetine',
  'lexapro': 'escitalopram',
  'xanax': 'alprazolam',
  'valium': 'diazepam',
  'ativan': 'lorazepam',
  'glucophage': 'metformin',
  'synthroid': 'levothyroxine', 'levoxyl': 'levothyroxine',
  'norvasc': 'amlodipine',
  'zestril': 'lisinopril', 'prinivil': 'lisinopril',
  'vasotec': 'enalapril',
  'altace': 'ramipril',
  'cozaar': 'losartan',
  'diovan': 'valsartan',
  'toprol': 'metoprolol', 'lopressor': 'metoprolol',
  'tenormin': 'atenolol',
  'coreg': 'carvedilol',
  'aldactone': 'spironolactone',
  'lanoxin': 'digoxin',
  'cardizem': 'diltiazem', 'tiazac': 'diltiazem',
  'calan': 'verapamil', 'isoptin': 'verapamil',
  'cipro': 'ciprofloxacin',
  'levaquin': 'levofloxacin',
  'biaxin': 'clarithromycin',
  'zithromax': 'azithromycin', 'z-pack': 'azithromycin',
  'amoxil': 'amoxicillin', 'augmentin': 'amoxicillin',
  'ultram': 'tramadol',
  'oxycontin': 'oxycodone', 'percocet': 'oxycodone',
  'vicodin': 'hydrocodone', 'norco': 'hydrocodone',
  'elavil': 'amitriptyline',
  'cymbalta': 'duloxetine',
  'effexor': 'venlafaxine',
  'celebrex': 'celecoxib',
  'voltaren': 'diclofenac',
  'eliquis': 'apixaban',
  'xarelto': 'rivaroxaban',
  'pradaxa': 'dabigatran',
  'brilinta': 'ticagrelor',
  'theo-dur': 'theophylline',
};

// ─── Class-level interaction rules ───
interface ClassInteractionRule {
  class1?: string;
  drug1?: string;
  class2?: string;
  drug2?: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
}

const classInteractionRules: ClassInteractionRule[] = [
  // ── Major ──
  { class1: 'anticoagulant', class2: 'nsaid', severity: 'major', description: 'NSAIDs increase bleeding risk significantly when combined with anticoagulants. Avoid this combination or monitor closely.' },
  { class1: 'anticoagulant', class2: 'antiplatelet', severity: 'major', description: 'Combining anticoagulants with antiplatelets greatly increases bleeding risk. Use only under close medical supervision.' },
  { class1: 'maoi', class2: 'ssri', severity: 'major', description: 'Potentially fatal serotonin syndrome. This combination is contraindicated — do NOT use together.' },
  { class1: 'maoi', class2: 'snri', severity: 'major', description: 'Potentially fatal serotonin syndrome. This combination is contraindicated — do NOT use together.' },
  { class1: 'maoi', class2: 'opioid', severity: 'major', description: 'MAOIs with opioids can cause severe CNS effects and serotonin syndrome. Avoid this combination.' },
  { class1: 'maoi', class2: 'tricyclic_antidepressant', severity: 'major', description: 'Risk of hypertensive crisis and serotonin syndrome. This combination is generally contraindicated.' },
  { class1: 'opioid', class2: 'benzodiazepine', severity: 'major', description: 'Combined CNS depression can cause fatal respiratory depression. FDA black box warning — avoid combination.' },
  { class1: 'ace_inhibitor', class2: 'potassium_sparing_diuretic', severity: 'major', description: 'Both increase potassium levels, risking dangerous hyperkalemia. Monitor potassium closely.' },
  { class1: 'arb', class2: 'potassium_sparing_diuretic', severity: 'major', description: 'Both increase potassium levels, risking dangerous hyperkalemia. Monitor potassium closely.' },
  { class1: 'ace_inhibitor', class2: 'arb', severity: 'major', description: 'Dual RAAS blockade increases risk of hypotension, hyperkalemia, and renal impairment. Generally avoid.' },
  { drug1: 'methotrexate', class2: 'nsaid', severity: 'major', description: 'NSAIDs reduce renal clearance of methotrexate, significantly increasing toxicity risk.' },
  { drug1: 'lithium', class2: 'nsaid', severity: 'major', description: 'NSAIDs can increase lithium levels to toxic range. Monitor lithium levels closely.' },
  { drug1: 'lithium', class2: 'ace_inhibitor', severity: 'major', description: 'ACE inhibitors can increase lithium levels. Monitor lithium levels closely.' },
  { drug1: 'digoxin', drug2: 'verapamil', severity: 'major', description: 'Verapamil significantly increases digoxin levels, leading to potential toxicity.' },
  { drug1: 'digoxin', drug2: 'amiodarone', severity: 'major', description: 'Amiodarone increases digoxin levels by 70-100%. Reduce digoxin dose by half.' },
  { class1: 'statin', drug2: 'gemfibrozil', severity: 'major', description: 'Gemfibrozil significantly increases statin levels, greatly increasing risk of rhabdomyolysis. Avoid combination.' },
  { drug1: 'methotrexate', drug2: 'trimethoprim', severity: 'major', description: 'Both are folate antagonists. Combined use increases bone marrow suppression risk.' },
  { class1: 'ssri', class2: 'tricyclic_antidepressant', severity: 'major', description: 'SSRIs inhibit TCA metabolism, increasing TCA levels and risk of cardiac toxicity and serotonin syndrome.' },
  { drug1: 'phenytoin', class2: 'fluoroquinolone', severity: 'major', description: 'Fluoroquinolones can alter phenytoin levels. Monitor anticonvulsant levels carefully.' },

  // ── Moderate ──
  { class1: 'ssri', class2: 'nsaid', severity: 'moderate', description: 'SSRIs increase bleeding risk when combined with NSAIDs due to impaired platelet function.' },
  { class1: 'ssri', class2: 'opioid', severity: 'moderate', description: 'Risk of serotonin syndrome, especially with tramadol, fentanyl, or meperidine. Monitor for symptoms.' },
  { class1: 'statin', class2: 'macrolide', severity: 'moderate', description: 'Macrolide antibiotics can increase statin levels, raising risk of muscle damage (myopathy/rhabdomyolysis).' },
  { class1: 'statin', class2: 'calcium_channel_blocker', severity: 'moderate', description: 'Calcium channel blockers may increase statin levels. Dose adjustment may be needed.' },
  { class1: 'ppi', class2: 'antiplatelet', severity: 'moderate', description: 'PPIs (especially omeprazole) may reduce effectiveness of clopidogrel. Consider alternative PPI.' },
  { class1: 'fluoroquinolone', class2: 'nsaid', severity: 'moderate', description: 'Combining fluoroquinolones with NSAIDs may increase seizure risk.' },
  { drug1: 'metformin', class2: 'fluoroquinolone', severity: 'moderate', description: 'Fluoroquinolones can cause unpredictable blood glucose changes in diabetic patients on metformin.' },
  { class1: 'beta_blocker', class2: 'calcium_channel_blocker', severity: 'moderate', description: 'Risk of excessive bradycardia and hypotension. Monitor heart rate and blood pressure.' },
  { class1: 'beta_blocker', class2: 'sulfonylurea', severity: 'moderate', description: 'Beta-blockers can mask hypoglycemia symptoms and prolong low blood sugar episodes.' },
  { class1: 'thyroid_hormone', drug2: 'calcium', severity: 'moderate', description: 'Calcium reduces absorption of thyroid hormones. Take at least 4 hours apart.' },
  { class1: 'thyroid_hormone', drug2: 'iron', severity: 'moderate', description: 'Iron reduces absorption of thyroid hormones. Take at least 4 hours apart.' },
  { class1: 'fluoroquinolone', drug2: 'theophylline', severity: 'moderate', description: 'Fluoroquinolones (especially ciprofloxacin) can increase theophylline levels, risking toxicity.' },
  { drug1: 'metformin', drug2: 'alcohol', severity: 'moderate', description: 'Alcohol increases risk of lactic acidosis with metformin and affects blood glucose control.' },
  { class1: 'benzodiazepine', drug2: 'alcohol', severity: 'moderate', description: 'Alcohol enhances CNS depressant effects of benzodiazepines, increasing sedation and respiratory depression risk.' },
  { class1: 'anticoagulant', class2: 'ssri', severity: 'moderate', description: 'SSRIs impair platelet function and increase bleeding risk with anticoagulants. Monitor for signs of bleeding.' },
  { drug1: 'phenytoin', class2: 'macrolide', severity: 'moderate', description: 'Macrolides can increase phenytoin levels. Monitor for toxicity symptoms.' },
  { drug1: 'carbamazepine', class2: 'macrolide', severity: 'moderate', description: 'Macrolides (especially erythromycin/clarithromycin) can increase carbamazepine levels significantly.' },

  // ── Minor ──
  { drug1: 'acetaminophen', drug2: 'caffeine', severity: 'minor', description: 'Caffeine may enhance the pain-relieving effects of acetaminophen. Generally considered beneficial.' },
  { class1: 'ppi', class2: 'thyroid_hormone', severity: 'minor', description: 'PPIs may reduce absorption of thyroid hormones slightly. Monitor thyroid levels.' },
  { class1: 'statin', drug2: 'grapefruit', severity: 'minor', description: 'Grapefruit can increase statin levels (especially simvastatin/atorvastatin). Avoid large amounts.' },
];

// ─── Direct drug-pair interactions (for specific pairs not covered by class rules) ───
const directInteractions: Record<string, DrugInteraction> = {
  'warfarin-acetaminophen': { severity: 'moderate', description: 'High-dose or chronic acetaminophen use may enhance warfarin anticoagulant effect. Monitor INR.', drugs: ['warfarin', 'acetaminophen'] },
  'metformin-contrast dye': { severity: 'major', description: 'Iodinated contrast media with metformin can cause lactic acidosis. Hold metformin before and 48h after contrast.', drugs: ['metformin', 'contrast dye'] },
  'sildenafil-nitroglycerin': { severity: 'major', description: 'PDE5 inhibitors with nitrates cause severe, potentially fatal hypotension. Absolutely contraindicated.', drugs: ['sildenafil', 'nitroglycerin'] },
  'sildenafil-isosorbide': { severity: 'major', description: 'PDE5 inhibitors with nitrates cause severe hypotension. Absolutely contraindicated.', drugs: ['sildenafil', 'isosorbide'] },
  'potassium-spironolactone': { severity: 'major', description: 'Potassium supplements with potassium-sparing diuretics risk severe hyperkalemia.', drugs: ['potassium', 'spironolactone'] },
  'amoxicillin-methotrexate': { severity: 'major', description: 'Penicillins may reduce renal clearance of methotrexate, increasing toxicity risk.', drugs: ['amoxicillin', 'methotrexate'] },
  'valproic acid-lamotrigine': { severity: 'moderate', description: 'Valproic acid doubles lamotrigine levels, increasing risk of serious rash (Stevens-Johnson syndrome). Reduce lamotrigine dose.', drugs: ['valproic acid', 'lamotrigine'] },
  'allopurinol-azathioprine': { severity: 'major', description: 'Allopurinol inhibits metabolism of azathioprine, dramatically increasing toxicity risk. Reduce azathioprine dose by 75%.', drugs: ['allopurinol', 'azathioprine'] },
  'potassium-lisinopril': { severity: 'moderate', description: 'ACE inhibitors can increase potassium levels. Adding potassium supplements may lead to hyperkalemia.', drugs: ['potassium', 'lisinopril'] },
  'potassium-enalapril': { severity: 'moderate', description: 'ACE inhibitors can increase potassium levels. Adding potassium supplements may lead to hyperkalemia.', drugs: ['potassium', 'enalapril'] },
};

class DrugInteractionService {
  private openFDABaseURL = 'https://api.fda.gov/drug';

  /**
   * Normalize a drug name: lowercase, strip dosages/formulations, resolve aliases
   */
  private normalizeDrug(name: string): string {
    let norm = name.toLowerCase().trim()
      .replace(/\s+\d+(\.\d+)?\s*(mg|mcg|ml|g|iu|%)\b.*$/i, '')
      .replace(/\s+(tablet|capsule|injection|syrup|cream|ointment|gel|solution|suspension|drops|patch|inhaler)s?\b.*$/i, '')
      .replace(/\s+(extended|delayed|sustained|controlled)[\s-]release\b/i, '')
      .replace(/\s+(er|sr|cr|xr|xl|dr|ec)\b$/i, '')
      .trim();
    return drugAliases[norm] || norm;
  }

  /**
   * Get all drug classes a given (normalized) drug belongs to
   */
  private getClassesForDrug(drug: string): string[] {
    const classes: string[] = [];
    for (const [className, members] of Object.entries(drugClasses)) {
      if (members.some(m => drug.includes(m) || m.includes(drug))) {
        classes.push(className);
      }
    }
    return classes;
  }

  /**
   * Check for drug interactions between multiple medications
   */
  async checkInteractions(medications: string[]): Promise<DrugInteraction[]> {
    try {
      const interactions: DrugInteraction[] = [];
      const seen = new Set<string>();

      const normalized = medications.map(m => ({
        original: m,
        norm: this.normalizeDrug(m),
        classes: [] as string[],
      }));
      normalized.forEach(n => n.classes = this.getClassesForDrug(n.norm));

      for (let i = 0; i < normalized.length; i++) {
        for (let j = i + 1; j < normalized.length; j++) {
          const d1 = normalized[i];
          const d2 = normalized[j];

          // 1. Check direct drug-pair interactions
          const directKey1 = `${d1.norm}-${d2.norm}`;
          const directKey2 = `${d2.norm}-${d1.norm}`;
          const direct = directInteractions[directKey1] || directInteractions[directKey2];
          if (direct && !seen.has(directKey1)) {
            seen.add(directKey1);
            seen.add(directKey2);
            interactions.push({ ...direct, drugs: [d1.original, d2.original] });
            continue; // direct match takes priority
          }

          // 2. Check class-level interaction rules
          for (const rule of classInteractionRules) {
            const match = this.ruleMatches(rule, d1.norm, d1.classes, d2.norm, d2.classes);
            if (match) {
              const key = `${rule.description.substring(0, 40)}-${d1.norm}-${d2.norm}`;
              if (!seen.has(key)) {
                seen.add(key);
                interactions.push({
                  severity: rule.severity,
                  description: rule.description,
                  drugs: [d1.original, d2.original],
                });
              }
              break; // first matching rule wins per pair
            }
          }
        }
      }

      // Sort: major first, then moderate, then minor
      const order = { major: 0, moderate: 1, minor: 2 };
      interactions.sort((a, b) => order[a.severity] - order[b.severity]);

      return interactions;
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      throw new Error('Failed to check drug interactions');
    }
  }

  /**
   * Check if a rule matches a pair of drugs
   */
  private ruleMatches(
    rule: ClassInteractionRule,
    drug1: string, classes1: string[],
    drug2: string, classes2: string[]
  ): boolean {
    const matchesSide = (
      ruleDrug: string | undefined,
      ruleClass: string | undefined,
      drug: string,
      classes: string[]
    ) => {
      if (ruleDrug && ruleClass) return drug.includes(ruleDrug) && classes.includes(ruleClass);
      if (ruleDrug) return drug.includes(ruleDrug);
      if (ruleClass) return classes.includes(ruleClass);
      return false;
    };

    // Try both orderings
    const fwd = matchesSide(rule.drug1, rule.class1, drug1, classes1) &&
                matchesSide(rule.drug2, rule.class2, drug2, classes2);
    const rev = matchesSide(rule.drug1, rule.class1, drug2, classes2) &&
                matchesSide(rule.drug2, rule.class2, drug1, classes1);
    return fwd || rev;
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
