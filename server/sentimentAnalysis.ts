// Simple sentiment analysis without external APIs
// This provides basic sentiment scoring for demo purposes

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -100 to 100
  confidence: number; // 0 to 100
}

// Basic word lists for sentiment analysis
const positiveWords = [
  'excellent', 'amazing', 'great', 'good', 'fantastic', 'wonderful', 'awesome',
  'love', 'perfect', 'brilliant', 'outstanding', 'superb', 'impressive',
  'satisfied', 'happy', 'pleased', 'delighted', 'recommend', 'best', 'beautiful',
  'helpful', 'useful', 'easy', 'fast', 'quick', 'smooth', 'efficient'
];

const negativeWords = [
  'terrible', 'awful', 'bad', 'horrible', 'disappointing', 'frustrating',
  'hate', 'worst', 'useless', 'broken', 'slow', 'difficult', 'confusing',
  'angry', 'upset', 'annoyed', 'poor', 'lacking', 'missing', 'problem',
  'issue', 'bug', 'error', 'fail', 'failed', 'wrong', 'expensive'
];

const intensifiers = ['very', 'really', 'extremely', 'incredibly', 'absolutely', 'totally'];
const negators = ['not', 'no', 'never', 'nothing', 'nowhere', 'nobody', "don't", "doesn't", "won't", "can't"];

export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  let score = 0;
  let wordCount = 0;
  let intensifierMultiplier = 1;
  let negated = false;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check for negators
    if (negators.includes(word)) {
      negated = true;
      continue;
    }
    
    // Check for intensifiers
    if (intensifiers.includes(word)) {
      intensifierMultiplier = 1.5;
      continue;
    }
    
    // Check for sentiment words
    let wordScore = 0;
    if (positiveWords.includes(word)) {
      wordScore = 1;
      wordCount++;
    } else if (negativeWords.includes(word)) {
      wordScore = -1;
      wordCount++;
    }
    
    // Apply negation and intensification
    if (wordScore !== 0) {
      if (negated) {
        wordScore *= -1;
        negated = false;
      }
      wordScore *= intensifierMultiplier;
      score += wordScore;
      intensifierMultiplier = 1; // Reset after use
    }
  }
  
  // Calculate final score (-100 to 100)
  const normalizedScore = wordCount > 0 ? Math.round((score / wordCount) * 100) : 0;
  const clampedScore = Math.max(-100, Math.min(100, normalizedScore));
  
  // Determine sentiment category
  let sentiment: 'positive' | 'negative' | 'neutral';
  if (clampedScore > 20) {
    sentiment = 'positive';
  } else if (clampedScore < -20) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  // Calculate confidence based on number of sentiment words found
  const confidence = Math.min(100, Math.round((wordCount / Math.max(words.length / 10, 1)) * 100));
  
  return {
    sentiment,
    score: clampedScore,
    confidence: Math.max(10, confidence) // Minimum 10% confidence
  };
}