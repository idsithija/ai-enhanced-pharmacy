import { useState, useEffect, useRef } from 'react';
import { chatbotService, type ChatMessage } from '../services/chatbotService';

export const Chatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message
    const welcomeMessage = chatbotService.createMessage(
      'Hello! 👋 Welcome to our pharmacy AI assistant. I can help you with medicine information, prescriptions, store hours, delivery services, and more. What can I help you with today?',
      'bot',
      chatbotService.getSuggestedQuestions().slice(0, 4)
    );
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage = chatbotService.createMessage(textToSend, 'user');
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Get bot response
      const response = await chatbotService.sendMessage(textToSend);
      
      const botMessage = chatbotService.createMessage(
        response.message,
        'bot',
        response.suggestions,
        response.category
      );
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMessage = chatbotService.createMessage(
        'Sorry, I encountered an error. Please try again or contact our pharmacist directly.',
        'bot',
        ['Try again', 'Contact pharmacist']
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    const welcomeMessage = chatbotService.createMessage(
      'Chat cleared! How can I help you today?',
      'bot',
      chatbotService.getSuggestedQuestions().slice(0, 4)
    );
    setMessages([welcomeMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <span className="text-primary text-4xl">🤖</span>
          AI Pharmacy Assistant
        </h1>
        <p className="text-gray-600">
          Ask questions about medicines, prescriptions, store information, and pharmacy services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col" style={{ height: '70vh' }}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-dark text-lg">🤖</span>
                    </div>
                  )}
                  
                  <div className="max-w-[70%]">
                    <div
                      className={`p-3 rounded-lg shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-dark'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-dark transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">👤</span>
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-dark text-lg">🤖</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="text-sm text-gray-700 ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  placeholder="Ask me anything about pharmacy services..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  rows={1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:bg-gray-100"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  className="px-6 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span>✉️</span>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-4">
          {/* Quick Questions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>❓</span>
                Quick Questions
              </h3>
              <button
                onClick={handleClearChat}
                className="p-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                title="Clear chat"
              >
                🔄
              </button>
            </div>
            
            <div className="space-y-2">
              {chatbotService.getSuggestedQuestions().map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(question)}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-primary hover:text-dark hover:border-primary transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              What I Can Help With
            </h3>
            <div className="space-y-2">
              {[
                '💊 Medicine availability & pricing',
                '📋 Prescription uploads & verification',
                '🚚 Delivery & shipping information',
                '⏰ Store hours & locations',
                '⚠️ Drug interactions & side effects',
                '👶 Pediatric & pregnancy safety',
                '💳 Payment & insurance',
                '🔄 Refills & repeat orders',
              ].map((feature, index) => (
                <p key={index} className="text-sm text-gray-700 pl-1">
                  {feature}
                </p>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <h4 className="text-sm font-bold text-yellow-900 mb-2">
              ⚠️ Important Information
            </h4>
            <p className="text-sm text-yellow-800">
              This AI assistant provides general pharmacy information. For medical advice, diagnosis, or treatment, always consult with a qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
