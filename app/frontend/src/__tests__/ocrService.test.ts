import { describe, it, expect, vi } from 'vitest';
import { getConfidenceDisplay } from '../services/ocrService';

// Mock auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ token: 'test-token' }),
  },
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    })),
  },
}));

describe('OCR Service', () => {
  describe('getConfidenceDisplay', () => {
    it('should return High for confidence >= 80%', () => {
      const result = getConfidenceDisplay(85);
      expect(result.level).toBe('High');
      expect(result.color).toBe('#4caf50');
      expect(result.severity).toBe('success');
    });

    it('should return High for 0-1 scale confidence >= 0.8', () => {
      const result = getConfidenceDisplay(0.92);
      expect(result.level).toBe('High');
    });

    it('should return Medium for confidence between 60-79%', () => {
      const result = getConfidenceDisplay(65);
      expect(result.level).toBe('Medium');
      expect(result.color).toBe('#ff9800');
      expect(result.severity).toBe('warning');
    });

    it('should return Medium for 0-1 scale confidence between 0.6-0.79', () => {
      const result = getConfidenceDisplay(0.7);
      expect(result.level).toBe('Medium');
    });

    it('should return Low for confidence < 60%', () => {
      const result = getConfidenceDisplay(45);
      expect(result.level).toBe('Low');
      expect(result.color).toBe('#f44336');
      expect(result.severity).toBe('error');
    });

    it('should return Low for 0-1 scale confidence < 0.6', () => {
      const result = getConfidenceDisplay(0.3);
      expect(result.level).toBe('Low');
    });

    it('should handle boundary value at exactly 80', () => {
      const result = getConfidenceDisplay(80);
      expect(result.level).toBe('High');
    });

    it('should handle boundary value at exactly 60', () => {
      const result = getConfidenceDisplay(60);
      expect(result.level).toBe('Medium');
    });

    it('should handle 100% confidence', () => {
      const result = getConfidenceDisplay(100);
      expect(result.level).toBe('High');
    });

    it('should handle 0% confidence', () => {
      const result = getConfidenceDisplay(0);
      expect(result.level).toBe('Low');
    });
  });
});
