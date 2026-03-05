import { drugInteractionService } from '../../services/drugInteractionService';

describe('Drug Interaction Service Tests', () => {
  describe('checkInteractions()', () => {
    it('should detect Warfarin + Aspirin interaction (major)', async () => {
      const medications = ['Warfarin', 'Aspirin'];
      const result = await drugInteractionService.checkInteractions(medications);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const warfarinAspirinInteraction = result.find(
        (i) =>
          i.drugs.some(d => d.toLowerCase().includes('warfarin')) &&
          i.drugs.some(d => d.toLowerCase().includes('aspirin'))
      );

      expect(warfarinAspirinInteraction).toBeDefined();
      expect(warfarinAspirinInteraction?.severity).toBe('major');
    });

    it('should detect Simvastatin + Gemfibrozil interaction (major)', async () => {
      const medications = ['Simvastatin', 'Gemfibrozil'];
      const result = await drugInteractionService.checkInteractions(medications);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].severity).toBe('major');
    });

    it('should detect Lisinopril + Potassium interaction (moderate)', async () => {
      const medications = ['Lisinopril', 'Potassium Supplements'];
      const result = await drugInteractionService.checkInteractions(medications);

      expect(result.length).toBeGreaterThan(0);
      const interaction = result.find((i) => i.severity === 'moderate');
      expect(interaction).toBeDefined();
    });

    it('should return no interactions for safe combination', async () => {
      const medications = ['Vitamin C', 'Calcium'];
      const result = await drugInteractionService.checkInteractions(medications);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle single medication (no interactions)', async () => {
      const medications = ['Aspirin'];
      const result = await drugInteractionService.checkInteractions(medications);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle empty medication list', async () => {
      const medications: string[] = [];
      const result = await drugInteractionService.checkInteractions(medications);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should detect multiple interactions in complex prescription', async () => {
      const medications = [
        'Warfarin',
        'Aspirin',
        'Ibuprofen',
        'Simvastatin',
        'Gemfibrozil',
      ];
      const result = await drugInteractionService.checkInteractions(medications);

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeGreaterThan(1);
    });

    it('should include required interaction details', async () => {
      const medications = ['Warfarin', 'Aspirin'];
      const result = await drugInteractionService.checkInteractions(medications);

      if (result.length > 0) {
        const interaction = result[0];
        expect(interaction).toHaveProperty('severity');
        expect(interaction).toHaveProperty('description');
        expect(interaction).toHaveProperty('drugs');
        expect(interaction.drugs).toBeInstanceOf(Array);
      }
    });

    it('should categorize severity correctly', async () => {
      const majorMeds = ['Warfarin', 'Aspirin'];
      const majorResult = await drugInteractionService.checkInteractions(majorMeds);

      majorResult.forEach((interaction) => {
        expect(['major', 'moderate', 'minor']).toContain(interaction.severity);
      });
    });
  });

  describe('Statistics and Validation', () => {
    it('should count interactions correctly', async () => {
      const medications = ['Warfarin', 'Aspirin', 'Simvastatin', 'Gemfibrozil'];
      const result = await drugInteractionService.checkInteractions(medications);

      const majorCount = result.filter(i => i.severity === 'major').length;
      const moderateCount = result.filter(i => i.severity === 'moderate').length;
      const minorCount = result.filter(i => i.severity === 'minor').length;
      
      expect(result.length).toBe(majorCount + moderateCount + minorCount);
    });

    it('should identify critical interactions', async () => {
      const medications = ['Warfarin', 'Aspirin'];
      const result = await drugInteractionService.checkInteractions(medications);

      const hasCritical = result.some(i => i.severity === 'major');
      
      if (result.length > 0) {
        expect(hasCritical).toBe(true);
      }
    });
  });
});
