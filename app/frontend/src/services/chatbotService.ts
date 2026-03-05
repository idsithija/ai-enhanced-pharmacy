import api from './api';
import type { ApiResponse } from '../types';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  category?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  category?: string;
  confidence?: number;
  timestamp: string;
}

export const chatbotService = {
  /**
   * Send message to chatbot and get response
   */
  sendMessage: async (message: string, context?: any): Promise<ChatResponse> => {
    try {
      const response = await api.post<ApiResponse<ChatResponse>>('/ai/chatbot', {
        message,
        context,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error sending message to chatbot:', error);
      // Return fallback response
      return {
        message: 'Sorry, I\'m having trouble connecting right now. Please try again or contact our pharmacist directly.',
        suggestions: ['Try again', 'Contact pharmacist', 'View FAQs'],
        category: 'error',
        confidence: 0,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get suggested questions for quick access
   */
  getSuggestedQuestions(): string[] {
    return [
      'What are your store hours?',
      'Do you offer home delivery?',
      'How can I upload a prescription?',
      'Check drug interactions',
      'What payment methods do you accept?',
      'Do you have generic alternatives?',
      'Is this medicine safe during pregnancy?',
      'How should I store my medicines?',
      'What are the side effects?',
      'Can I get a refill?',
    ];
  },

  /**
   * Create a chat message object
   */
  createMessage(text: string, sender: 'user' | 'bot', suggestions?: string[], category?: string): ChatMessage {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      sender,
      timestamp: new Date(),
      suggestions,
      category,
    };
  },
};
