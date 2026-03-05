// Pharmacy Chatbot Knowledge Base
// Rule-based NLP chatbot for common pharmacy queries

interface ChatResponse {
  response: string;
  suggestions?: string[];
  category?: string;
  confidence?: number;
}

interface KnowledgeEntry {
  keywords: string[];
  patterns: RegExp[];
  response: string;
  suggestions: string[];
  category: string;
}

export class PharmacyChatbot {
  private knowledgeBase: KnowledgeEntry[] = [
    // Medicine Availability
    {
      keywords: ['available', 'stock', 'have', 'find', 'get'],
      patterns: [/do you (have|stock|carry)/i, /is .* available/i, /can i (get|find|buy)/i],
      response: 'To check medicine availability, please search for the specific medicine name in our system. If a medicine is out of stock, our pharmacist can recommend suitable alternatives or help you place a special order.',
      suggestions: ['Search medicines', 'Contact pharmacist', 'View alternatives'],
      category: 'availability',
    },
    // Medicine Pricing
    {
      keywords: ['price', 'cost', 'how much', 'expensive', 'cheap', 'affordable'],
      patterns: [/how much (is|does|cost)/i, /what('s| is) the price/i, /cost of/i],
      response: 'Medicine prices vary based on brand, dosage, and quantity. You can search for specific medicines in our catalog to see current prices. We also offer generic alternatives that are more affordable. For bulk orders, please contact our sales team for special pricing.',
      suggestions: ['Search medicines', 'View generic options', 'Contact sales'],
      category: 'pricing',
    },
    // Prescription Services
    {
      keywords: ['prescription', 'rx', 'doctor note', 'upload', 'verify'],
      patterns: [/upload prescription/i, /(need|require) prescription/i, /prescription (verification|check)/i],
      response: 'You can upload your prescription image through our prescription upload feature. Our licensed pharmacist will verify it within 30 minutes during business hours. We accept both e-prescriptions and photos of physical prescriptions. Prescription medicines can only be dispensed after verification.',
      suggestions: ['Upload prescription', 'Check prescription status', 'Contact pharmacist'],
      category: 'prescription',
    },
    // Store Hours & Location
    {
      keywords: ['open', 'close', 'hours', 'timing', 'schedule', 'location', 'where'],
      patterns: [/when (do you|are you) open/i, /(store|pharmacy) hours/i, /where (is|are you) located/i],
      response: 'Our pharmacy is open Monday to Saturday: 9:00 AM - 8:00 PM, and Sunday: 10:00 AM - 6:00 PM. We are located at [Your Address]. For emergency medicine needs outside business hours, please call our 24/7 helpline.',
      suggestions: ['View location map', 'Emergency contact', 'Plan visit'],
      category: 'hours',
    },
    // Delivery Services
    {
      keywords: ['delivery', 'shipping', 'courier', 'home delivery', 'send'],
      patterns: [/deliver/i, /shipping/i, /can you send/i, /home delivery/i],
      response: 'Yes! We offer same-day home delivery for orders placed before 2 PM. Delivery is FREE for orders above ₹500. Standard delivery takes 2-4 hours within city limits. You can track your order in real-time after placing it.',
      suggestions: ['Check delivery area', 'Place order', 'Track my order'],
      category: 'delivery',
    },
    // Drug Interactions
    {
      keywords: ['interaction', 'combine', 'together', 'mix', 'safe'],
      patterns: [/can i take .* with/i, /interaction between/i, /(safe|okay) to (combine|mix)/i],
      response: 'Drug interactions can be serious! Please use our AI Drug Interaction Checker tool to check if your medicines are safe to take together. Our system checks for major, moderate, and minor interactions. For personalized advice, always consult our pharmacist or your doctor.',
      suggestions: ['Drug Interaction Checker', 'Contact pharmacist', 'View safety info'],
      category: 'interactions',
    },
    // Side Effects
    {
      keywords: ['side effect', 'adverse', 'reaction', 'allergy', 'symptom'],
      patterns: [/side effects? (of|for)/i, /adverse (reaction|effect)/i, /allergic/i],
      response: 'Side effects vary by medicine and individual. Common side effects are usually listed on the medicine package. For detailed information about specific medicines, please search our database or consult our pharmacist. If you experience severe side effects, seek medical attention immediately.',
      suggestions: ['Search medicine info', 'Contact pharmacist', 'Emergency services'],
      category: 'side-effects',
    },
    // Generic vs Brand
    {
      keywords: ['generic', 'brand', 'alternative', 'substitute', 'equivalent'],
      patterns: [/generic (version|alternative)/i, /(cheaper|alternative) to/i, /substitute for/i],
      response: 'Generic medicines contain the same active ingredients as branded versions but cost 30-80% less. They are equally effective and FDA-approved. Our pharmacist can recommend suitable generic alternatives for most branded medicines. Would you like to know about a specific medicine?',
      suggestions: ['View generic options', 'Compare prices', 'Contact pharmacist'],
      category: 'generic',
    },
    // Dosage Information
    {
      keywords: ['dosage', 'dose', 'how much', 'how many', 'frequency', 'take'],
      patterns: [/how (much|many|often)/i, /dosage (of|for)/i, /how to take/i],
      response: 'Dosage depends on the medicine, your age, weight, and medical condition. Always follow your doctor\'s prescription exactly. Never change dosage without consulting your doctor. For over-the-counter medicines, follow the package instructions or ask our pharmacist.',
      suggestions: ['Read prescription', 'Contact pharmacist', 'View medicine guide'],
      category: 'dosage',
    },
    // Refills & Repeat Orders
    {
      keywords: ['refill', 'repeat', 'reorder', 'again', 'same order'],
      patterns: [/refill/i, /order again/i, /repeat (order|prescription)/i],
      response: 'You can easily reorder medicines through your order history. For prescription medicines, please ensure you have a valid prescription. We\'ll notify you when your regular medicines are due for refill. Set up auto-refill to never run out!',
      suggestions: ['View order history', 'Set up auto-refill', 'Upload new prescription'],
      category: 'refills',
    },
    // Payment Methods
    {
      keywords: ['payment', 'pay', 'card', 'cash', 'upi', 'wallet'],
      patterns: [/payment method/i, /can i pay (with|by|using)/i, /accept/i],
      response: 'We accept multiple payment methods: Cash, Credit/Debit Cards, UPI, Mobile Wallets, and Net Banking. For online orders, you can also choose Cash on Delivery. All transactions are secure and encrypted.',
      suggestions: ['View payment options', 'Place order', 'Payment security info'],
      category: 'payment',
    },
    // Emergency Services
    {
      keywords: ['emergency', 'urgent', '24/7', 'immediate', 'now', 'asap'],
      patterns: [/emergency/i, /urgent/i, /need (now|immediately|asap)/i, /24.*7/i],
      response: 'For medical emergencies, please call 911 immediately. For pharmacy emergencies after hours, contact our 24/7 helpline at (555) 123-4567. We maintain emergency stock of critical medicines and can arrange urgent delivery.',
      suggestions: ['Emergency hotline', 'Nearest hospital', 'Critical medicines'],
      category: 'emergency',
    },
    // Pregnancy & Breastfeeding
    {
      keywords: ['pregnant', 'pregnancy', 'breastfeeding', 'nursing', 'expecting'],
      patterns: [/(safe|okay) (during|while) (pregnant|pregnancy|breastfeeding)/i, /pregnant women/i],
      response: 'Many medicines are not safe during pregnancy or breastfeeding. ALWAYS consult your doctor before taking any medicine if you are pregnant, planning pregnancy, or breastfeeding. Our pharmacist can provide general guidance but cannot replace medical advice.',
      suggestions: ['Contact pharmacist', 'Consult doctor', 'Pregnancy-safe medicines'],
      category: 'pregnancy',
    },
    // Children & Pediatric
    {
      keywords: ['child', 'children', 'baby', 'infant', 'kid', 'pediatric'],
      patterns: [/(safe |okay )?for (children|kids|baby|infant)/i, /pediatric/i, /child dose/i],
      response: 'Children\'s medicines require special dosing based on age and weight. Never give adult medicines to children without doctor approval. We stock pediatric formulations that are safer and easier to administer. Always consult a pediatrician for children under 12.',
      suggestions: ['Pediatric medicines', 'Dosage calculator', 'Contact pharmacist'],
      category: 'pediatric',
    },
    // Storage & Expiry
    {
      keywords: ['store', 'storage', 'keep', 'expiry', 'expire', 'shelf life'],
      patterns: [/how to store/i, /storage (condition|instruction)/i, /expir(y|ed)/i],
      response: 'Most medicines should be stored in a cool, dry place away from direct sunlight. Check the package for specific storage instructions. Never use expired medicines. Some medicines require refrigeration - check the label. Keep all medicines out of reach of children.',
      suggestions: ['Storage guidelines', 'Check expiry dates', 'Dispose expired meds'],
      category: 'storage',
    },
    // Insurance & Reimbursement
    {
      keywords: ['insurance', 'claim', 'reimburse', 'coverage', 'benefits'],
      patterns: [/insurance accept/i, /file (a )?claim/i, /reimburse/i],
      response: 'We work with major insurance providers. Please present your insurance card before purchase. We can help you file claims and provide necessary documentation. Coverage varies by plan - check with your insurance provider for details.',
      suggestions: ['Accepted insurance', 'File claim', 'Contact support'],
      category: 'insurance',
    },
    // Vitamins & Supplements
    {
      keywords: ['vitamin', 'supplement', 'multivitamin', 'omega', 'calcium', 'protein'],
      patterns: [/vitamin/i, /supplement/i, /multivitamin/i],
      response: 'We stock a wide range of vitamins, minerals, and dietary supplements. While many are available over-the-counter, it\'s best to consult a healthcare provider before starting supplements, especially if you have health conditions or take other medicines.',
      suggestions: ['Browse supplements', 'Consult pharmacist', 'Personalized recommendations'],
      category: 'supplements',
    },
  ];

  /**
   * Process user message and generate response
   */
  public processMessage(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    // Greeting detection
    if (this.isGreeting(lowerMessage)) {
      return {
        response: 'Hello! 👋 Welcome to our pharmacy. I\'m here to help you with medicine information, prescriptions, store hours, delivery services, and more. What can I help you with today?',
        suggestions: ['Check medicine availability', 'Upload prescription', 'Store hours', 'Delivery info'],
        category: 'greeting',
        confidence: 1.0,
      };
    }

    // Thank you detection
    if (this.isThankYou(lowerMessage)) {
      return {
        response: 'You\'re welcome! 😊 If you have any other questions about medicines or pharmacy services, feel free to ask. Stay healthy!',
        suggestions: ['Ask another question', 'Contact pharmacist', 'Browse medicines'],
        category: 'thanks',
        confidence: 1.0,
      };
    }

    // Find best matching knowledge entry
    let bestMatch: KnowledgeEntry | null = null;
    let bestScore = 0;

    for (const entry of this.knowledgeBase) {
      let score = 0;

      // Check keywords
      const keywordMatches = entry.keywords.filter(keyword => 
        lowerMessage.includes(keyword)
      ).length;
      score += keywordMatches * 10;

      // Check patterns
      const patternMatches = entry.patterns.filter(pattern =>
        pattern.test(message)
      ).length;
      score += patternMatches * 20;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    // Return best match or fallback
    if (bestMatch && bestScore >= 10) {
      return {
        response: bestMatch.response,
        suggestions: bestMatch.suggestions,
        category: bestMatch.category,
        confidence: Math.min(bestScore / 50, 1.0),
      };
    }

    // Fallback response
    return {
      response: 'I\'m not sure I understand that question. I can help you with medicine availability, pricing, prescriptions, delivery, drug interactions, side effects, and general pharmacy services. Could you please rephrase your question?',
      suggestions: [
        'Check medicine availability',
        'Drug interaction checker',
        'Upload prescription',
        'Contact pharmacist',
      ],
      category: 'fallback',
      confidence: 0.0,
    };
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
    return greetings.some(greeting => message.startsWith(greeting));
  }

  private isThankYou(message: string): boolean {
    const thanks = ['thank', 'thanks', 'appreciate', 'grateful'];
    return thanks.some(thank => message.includes(thank));
  }

  /**
   * Get suggested questions for users
   */
  public getSuggestedQuestions(): string[] {
    return [
      'What are your store hours?',
      'Do you offer home delivery?',
      'How can I upload a prescription?',
      'Check drug interactions',
      'What payment methods do you accept?',
      'Do you have generic alternatives?',
      'How to store medicines properly?',
      'Is this medicine available?',
      'What are the side effects?',
      'Can I get a refill?',
    ];
  }
}

export const pharmacyChatbot = new PharmacyChatbot();
