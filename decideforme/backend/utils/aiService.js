/**
 * AI Service
 * Core AI decision engine using an OpenAI-compatible LLM API
 * Handles prompt engineering and response parsing
 */

const OpenAI = require('openai');

// Configure a generic OpenAI-compatible client (works with providers like OpenRouter)
const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_API_BASE_URL || 'https://openrouter.ai/api/v1'
});

/**
 * Build a rich system prompt with user context
 */
function buildSystemPrompt(user, preferences) {
  const profile = user.profile || {};
  const learnedPatterns = preferences?.learnedPatterns?.slice(-5) || [];
  const recentChoices = preferences?.recentChoices?.slice(-5) || [];

  return `You are DecideForMe, an elite AI decision assistant. Your job is to eliminate decision fatigue by making the perfect choice for the user.

## USER PROFILE
- Name: ${user.name}
- Age: ${profile.age || 'unknown'}
- Fitness Goal: ${profile.fitnessGoal || 'not specified'}
- Diet Restrictions: ${profile.dietaryRestrictions?.join(', ') || 'none'}
- Work Style: ${profile.workStyle || 'not specified'}
- Budget Level: Food: ${profile.budget?.food || 'medium'}, Entertainment: ${profile.budget?.entertainment || 'medium'}

## LEARNED PATTERNS (from past decisions)
${learnedPatterns.length > 0 ? learnedPatterns.map(p => `- ${p.pattern}`).join('\n') : 'No patterns learned yet.'}

## RECENT CHOICES
${recentChoices.length > 0 ? recentChoices.map(c => `- ${c.category}: Chose "${c.chosen}" (${c.context})`).join('\n') : 'No recent choices.'}

## YOUR DECISION RULES
1. Always pick ONE clear winner. Never hedge or say "it depends."
2. Give a confident, specific reason (2-3 sentences max).
3. Base your reasoning on the user's profile, mood, time, and goals.
4. Confidence score: 70-100% range unless genuinely uncertain.
5. Be direct, friendly, and decisive.

## RESPONSE FORMAT
You MUST respond in valid JSON only, no markdown:
{
  "chosen": "<exact text of chosen option>",
  "reason": "<2-3 sentence explanation>",
  "confidence": <number 0-100>,
  "alternatives": [
    { "option": "<option text>", "note": "<why it wasn't chosen>" }
  ],
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}`;
}

/**
 * Build the user message for the AI
 */
function buildUserMessage(decision) {
  const { title, category, options, context } = decision;
  const optionsList = options.map((o, i) => `${i + 1}. ${o.text}`).join('\n');

  return `## DECISION REQUEST
Category: ${category.toUpperCase()}
Question: "${title}"

## MY OPTIONS
${optionsList}

## CURRENT CONTEXT
- Mood: ${context?.mood || 'neutral'}
- Time Available: ${context?.timeAvailable || 'flexible'}
- Priority: ${context?.priority || 'balanced'}
- Time of Day: ${context?.timeOfDay || 'unknown'}
${context?.weather ? `- Weather: ${context.weather}` : ''}
${context?.notes ? `- Additional Notes: ${context.notes}` : ''}

Please choose the best option for me right now.`;
}

/**
 * Main AI decision function
 * @param {Object} decision - The decision document
 * @param {Object} user - The user document
 * @param {Object} preferences - User preferences document
 * @returns {Object} AI result
 */
async function makeAIDecision(decision, user, preferences) {
  const startTime = Date.now();

  const systemPrompt = buildSystemPrompt(user, preferences);
  const userMessage = buildUserMessage(decision);

  try {
    const response = await openai.chat.completions.create({
      // Default model is an OpenAI-compatible, fast model via providers like OpenRouter
      model: process.env.LLM_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.4, // Some creativity but mostly consistent
      max_tokens: 400,
      response_format: { type: 'json_object' }
    });

    const rawContent = response.choices[0].message.content;
    const result = JSON.parse(rawContent);

    // Validate the chosen option exists in the original options
    const validOptions = decision.options.map(o => o.text);
    if (!validOptions.includes(result.chosen)) {
      // Find closest match
      result.chosen = validOptions[0];
      result.reason = result.reason || 'Selected based on your profile and context.';
    }

    return {
      ...result,
      model: process.env.LLM_MODEL || 'openai/gpt-4o-mini',
      processingTimeMs: Date.now() - startTime
    };

  } catch (err) {
    console.error('AI Decision Error:', err);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}

/**
 * Learn patterns from a completed decision with feedback
 * Updates the preferences.learnedPatterns array
 */
async function learnFromDecision(decision, preferences) {
  if (!preferences || !decision.feedback) return;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || 'openai/gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'Extract a short behavioral pattern from this decision data. Return JSON: { "pattern": "<concise pattern string>", "category": "<category>" }'
      }, {
        role: 'user',
        content: JSON.stringify({
          category: decision.category,
          chosen: decision.result.chosen,
          context: decision.context,
          followed: decision.feedback?.followed,
          rating: decision.feedback?.rating
        })
      }],
      temperature: 0.3,
      max_tokens: 100,
      response_format: { type: 'json_object' }
    });

    const learned = JSON.parse(response.choices[0].message.content);

    // Check if similar pattern exists
    const existingIdx = preferences.learnedPatterns?.findIndex(
      p => p.pattern.toLowerCase().includes(learned.pattern.toLowerCase().split(' ')[0])
    );

    if (existingIdx >= 0) {
      preferences.learnedPatterns[existingIdx].observedCount += 1;
      preferences.learnedPatterns[existingIdx].lastUpdated = new Date();
    } else {
      if (!preferences.learnedPatterns) preferences.learnedPatterns = [];
      preferences.learnedPatterns.push({
        pattern: learned.pattern,
        category: learned.category,
        confidence: 60,
        observedCount: 1,
        lastUpdated: new Date()
      });

      // Keep max 20 patterns
      if (preferences.learnedPatterns.length > 20) {
        preferences.learnedPatterns = preferences.learnedPatterns.slice(-20);
      }
    }

    await preferences.save();
  } catch (err) {
    // Non-critical, don't throw
    console.error('Pattern learning error:', err.message);
  }
}

module.exports = { makeAIDecision, learnFromDecision };
