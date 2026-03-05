import { pharmacyChatbot } from '../../services/chatbotService';

describe('Pharmacy Chatbot Service Tests', () => {
  describe('processMessage()', () => {
    it('should respond to medication availability query', () => {
      const result = pharmacyChatbot.processMessage('Do you have Aspirin in stock?');

      expect(result).toHaveProperty('response');
      expect(result.response).toContain('medicine');
      expect(result.category).toBe('availability');
      expect(result.confidence).toBeGreaterThan(0);
      if (result.suggestions) {
        expect(result.suggestions).toBeInstanceOf(Array);
      }
    });

    it('should respond to pricing questions', () => {
      const result = pharmacyChatbot.processMessage('How much does Paracetamol cost?');

      expect(result.category).toBe('pricing');
      expect(result.response.toLowerCase()).toContain('price');
      if (result.confidence !== undefined) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });

    it('should respond to store hours inquiry', () => {
      const result = pharmacyChatbot.processMessage('What are your opening hours?');

      expect(result.category).toBe('hours');
      expect(result.response).toContain('AM');
      if (result.suggestions) {
        expect(result.suggestions.length).toBeGreaterThan(0);
      }
    });

    it('should respond to delivery questions', () => {
      const result = pharmacyChatbot.processMessage('Do you offer home delivery?');

      expect(result.category).toBe('delivery');
      expect(result.response.toLowerCase()).toContain('delivery');
    });

    it('should handle greeting messages', () => {
      const result = pharmacyChatbot.processMessage('Hello');

      expect(result.response).toContain('Welcome');
      if (result.suggestions) {
        expect(result.suggestions.length).toBeGreaterThan(3);
      }
    });

    it('should handle thank you messages', () => {
      const result = pharmacyChatbot.processMessage('Thank you for your help!');

      expect(result.response.toLowerCase()).toContain('welcome');
      expect(result.category).toBe('thanks');
    });

    it('should provide drug interaction information', () => {
      const result = pharmacyChatbot.processMessage('Can I take Aspirin with Warfarin?');

      expect(result.category).toBe('interactions');
      expect(result.response.toLowerCase()).toContain('interaction');
    });

    it('should handle unknown queries gracefully', () => {
      const result = pharmacyChatbot.processMessage('xyz random query 123');

      expect(result.response).toBeDefined();
      if (result.suggestions) {
        expect(result.suggestions.length).toBeGreaterThan(0);
      }
      if (result.confidence !== undefined) {
        expect(result.confidence).toBeLessThan(100);
      }
    });
  });

  describe('getSuggestedQuestions()', () => {
    it('should return array of suggested questions', () => {
      const suggestions = pharmacyChatbot.getSuggestedQuestions();

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThanOrEqual(10);
      expect(typeof suggestions[0]).toBe('string');
      expect(suggestions[0].length).toBeGreaterThan(0);
    });
  });
});
