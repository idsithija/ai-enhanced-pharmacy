import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  HelpOutline,
  Refresh,
} from '@mui/icons-material';
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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy sx={{ fontSize: 40, color: '#667eea' }} />
          AI Pharmacy Assistant
        </Typography>
        <Typography color="text.secondary">
          Ask questions about medicines, prescriptions, store information, and pharmacy services.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Chat Area */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: '#f5f5f5',
              }}
            >
              <Stack spacing={2}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    {message.sender === 'bot' && (
                      <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                        <SmartToy sx={{ fontSize: 20 }} />
                      </Avatar>
                    )}
                    
                    <Box sx={{ maxWidth: '70%' }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: message.sender === 'user' ? '#667eea' : 'white',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.text}
                        </Typography>
                        
                        {message.suggestions && message.suggestions.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                            {message.suggestions.map((suggestion, index) => (
                              <Chip
                                key={index}
                                label={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                size="small"
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'primary.light', color: 'white' },
                                }}
                              />
                            ))}
                          </Stack>
                        )}
                      </Paper>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mt: 0.5, display: 'block' }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>

                    {message.sender === 'user' && (
                      <Avatar sx={{ bgcolor: '#764ba2', width: 32, height: 32 }}>
                        <Person sx={{ fontSize: 20 }} />
                      </Avatar>
                    )}
                  </Box>
                ))}
                
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                      <SmartToy sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                        Thinking...
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Stack>
            </Box>

            <Divider />

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Ask me anything about pharmacy services..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  multiline
                  maxRows={3}
                  variant="outlined"
                />
                <IconButton
                  color="primary"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  sx={{
                    bgcolor: '#667eea',
                    color: 'white',
                    '&:hover': { bgcolor: '#5568d3' },
                    '&:disabled': { bgcolor: 'grey.300' },
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Sidebar - Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {/* Quick Questions */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HelpOutline /> Quick Questions
                  </Typography>
                  <IconButton size="small" onClick={handleClearChat} title="Clear chat">
                    <Refresh />
                  </IconButton>
                </Box>
                
                <Stack spacing={1}>
                  {chatbotService.getSuggestedQuestions().map((question, index) => (
                    <Chip
                      key={index}
                      label={question}
                      onClick={() => handleSuggestionClick(question)}
                      variant="outlined"
                      sx={{
                        justifyContent: 'flex-start',
                        '&:hover': { bgcolor: 'primary.light', color: 'white', borderColor: 'primary.light' },
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  What I Can Help With
                </Typography>
                <Stack spacing={1}>
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
                    <Typography key={index} variant="body2" sx={{ pl: 1 }}>
                      {feature}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card sx={{ bgcolor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ⚠️ Important Information
                </Typography>
                <Typography variant="body2">
                  This AI assistant provides general pharmacy information. For medical advice, diagnosis, or treatment, always consult with a qualified healthcare professional.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
