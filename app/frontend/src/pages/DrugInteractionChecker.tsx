import { useState } from 'react';
import { drugInteractionService, type DrugInteraction, type MedicationInfo } from '../services/drugInteractionService';

// Safely extract text from FDA fields which can be string, string[], or nested arrays
const toText = (val: unknown, maxLen = 500): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.substring(0, maxLen);
  if (Array.isArray(val)) return toText(val.flat(3).join(' '), maxLen);
  return String(val).substring(0, maxLen);
};

export const DrugInteractionChecker = () => {
  const [medications, setMedications] = useState<string[]>([]);
  const [currentMedication, setCurrentMedication] = useState('');
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [medicationInfos, setMedicationInfos] = useState<Record<string, MedicationInfo>>({});
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedication = () => {
    const medication = currentMedication.trim();
    if (!medication) {
      setError('Please enter a medication name');
      return;
    }
    
    if (medications.includes(medication)) {
      setError('This medication is already in the list');
      return;
    }

    setMedications([...medications, medication]);
    setCurrentMedication('');
    setError('');
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    if (medications.length - 1 < 2) {
      setInteractions([]);
      setChecked(false);
    }
  };

  const handleCheckInteractions = async () => {
    if (medications.length < 2) {
      setError('Please add at least 2 medications to check for interactions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Run interaction check and FDA lookups in parallel
      const [result, ...fdaResults] = await Promise.all([
        drugInteractionService.checkInteractions(medications),
        ...medications.map(med => drugInteractionService.getMedicationInfo(med)),
      ]);

      setInteractions(result.interactions);
      setChecked(true);

      // Build medication info map
      const infos: Record<string, MedicationInfo> = {};
      medications.forEach((med, i) => {
        if (fdaResults[i]) {
          infos[med] = fdaResults[i]!;
        }
      });
      setMedicationInfos(infos);
    } catch (err: any) {
      setError(err.message || 'Failed to check drug interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMedications([]);
    setInteractions([]);
    setMedicationInfos({});
    setExpandedDrug(null);
    setChecked(false);
    setCurrentMedication('');
    setError('');
  };

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'major':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-800' };
      case 'moderate':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' };
      case 'minor':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-800' };
    }
  };

  const majorCount = interactions.filter(i => i.severity === 'major').length;
  const moderateCount = interactions.filter(i => i.severity === 'moderate').length;
  const minorCount = interactions.filter(i => i.severity === 'minor').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <span className="text-primary text-4xl">💊</span>
          AI Drug Interaction Checker
        </h1>
        <p className="text-gray-600">
          Check for potential drug interactions between multiple medications using AI-powered analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Add Medications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add Medications</h2>

          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="e.g., Aspirin, Warfarin, Ibuprofen"
                value={currentMedication}
                onChange={(e) => setCurrentMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
            <button
              onClick={handleAddMedication}
              className="px-6 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <span>+</span> Add
            </button>
          </div>

          <hr className="my-4" />

          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Medications List ({medications.length})
          </h3>

          {medications.length === 0 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                No medications added yet. Add at least 2 medications to check for interactions.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {medications.map((medication, index) => {
                const info = medicationInfos[medication];
                const isExpanded = expandedDrug === medication;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-between p-3">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => info && setExpandedDrug(isExpanded ? null : medication)}
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {medication}
                          {info && (
                            <span className="ml-2 text-xs font-normal text-green-600">✓ FDA data</span>
                          )}
                        </p>
                        {info?.genericName && info.genericName.toLowerCase() !== medication.toLowerCase() && (
                          <p className="text-xs text-gray-500">Generic: {info.genericName}</p>
                        )}
                        {info?.brandName && info.brandName.toLowerCase() !== medication.toLowerCase() && (
                          <p className="text-xs text-gray-500">Brand: {info.brandName}</p>
                        )}
                        {!info && Object.keys(medicationInfos).length > 0 && (
                          <p className="text-xs text-gray-400">No FDA data found</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveMedication(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                    {info && isExpanded && (
                      <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-2 text-xs">
                        {info.manufacturer && (
                          <p className="text-gray-600"><span className="font-semibold">Manufacturer:</span> {info.manufacturer}</p>
                        )}
                        {info.indications && (Array.isArray(info.indications) ? info.indications.length > 0 : !!info.indications) && (
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Indications:</p>
                            <p className="text-gray-600 line-clamp-3">{toText(info.indications, 300)}</p>
                          </div>
                        )}
                        {info.warnings && (Array.isArray(info.warnings) ? info.warnings.length > 0 : !!info.warnings) && (
                          <div className="bg-amber-50 border border-amber-200 rounded p-2">
                            <p className="font-semibold text-amber-800 mb-1">⚠️ FDA Warnings:</p>
                            <p className="text-amber-700 line-clamp-4">{toText(info.warnings, 400)}</p>
                          </div>
                        )}
                        {info.adverseReactions && (Array.isArray(info.adverseReactions) ? info.adverseReactions.length > 0 : !!info.adverseReactions) && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="font-semibold text-red-800 mb-1">Adverse Reactions:</p>
                            <p className="text-red-700 line-clamp-3">{toText(info.adverseReactions, 300)}</p>
                          </div>
                        )}
                        {info.dosageAndAdministration && (
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Dosage & Administration:</p>
                            <p className="text-gray-600 line-clamp-3">{toText(info.dosageAndAdministration, 300)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCheckInteractions}
              disabled={medications.length < 2 || loading}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-dark font-semibold rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Check Interactions
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={medications.length === 0}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Right Side - Results */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Interaction Results</h2>

          {medications.length < 2 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Add at least 2 medications and click "Check Interactions" to see results.
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !checked ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Click "Check Interactions" to analyze your medications.
              </p>
            </div>
          ) : interactions.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-2xl">✅</span>
                <div>
                  <p className="text-sm font-bold text-green-900 mb-1">No Known Interactions Detected</p>
                  <p className="text-sm text-green-800">
                    The medications in your list do not have any known interactions in our database.
                    However, always consult with a healthcare professional before combining medications.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {majorCount > 0 && (
                  <div className="bg-red-600 text-white rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold">{majorCount}</p>
                    <p className="text-xs">Major</p>
                  </div>
                )}
                {moderateCount > 0 && (
                  <div className="bg-yellow-600 text-white rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold">{moderateCount}</p>
                    <p className="text-xs">Moderate</p>
                  </div>
                )}
                {minorCount > 0 && (
                  <div className="bg-blue-600 text-white rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold">{minorCount}</p>
                    <p className="text-xs">Minor</p>
                  </div>
                )}
              </div>

              {/* Detailed Interactions */}
              <div className="space-y-3">
                {interactions.map((interaction, index) => {
                  const colors = getSeverityColors(interaction.severity);
                  return (
                    <div key={index} className={`p-4 border rounded-lg ${colors.bg} ${colors.border}`}>
                      <div className="flex items-start gap-2">
                        <span className={colors.text}>⚠️</span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold mb-2 ${colors.text}`}>
                            {interaction.drugs.join(' + ')}
                          </p>
                          <p className={`text-sm mb-2 ${colors.text}`}>
                            {interaction.description}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                            {interaction.severity.toUpperCase()} SEVERITY
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This tool provides information based on known drug interactions.
                  Always consult with a qualified healthcare professional before making any medication decisions.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-lg mb-3">
              <span className="text-primary text-5xl">+</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">1. Add Medications</h3>
            <p className="text-sm text-gray-600">
              Enter the names of medications you want to check
            </p>
          </div>
          <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-lg mb-3">
              <span className="text-primary text-5xl">🔍</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">2. AI Analysis</h3>
            <p className="text-sm text-gray-600">
              Our AI checks for known interactions using drug class matching
            </p>
          </div>
          <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-lg mb-3">
              <span className="text-primary text-5xl">🏛️</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">3. FDA Data</h3>
            <p className="text-sm text-gray-600">
              Drug details fetched from the FDA OpenFDA public database
            </p>
          </div>
          <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-lg mb-3">
              <span className="text-primary text-5xl">⚠️</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">4. Get Results</h3>
            <p className="text-sm text-gray-600">
              Receive interactions, warnings, and dosage info
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
