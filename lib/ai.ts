const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_KEY ?? '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';

async function chat(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        max_tokens: 120,
        temperature: 0.8,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  } catch {
    return '';
  }
}

export async function getMotivationalMessage(params: {
  mood: string | null;
  stressLevel: number;
  energyLevel: number;
  completedToday: number;
  totalToday: number;
  overdue: number;
  timeOfDay: string;
}): Promise<string> {
  const { mood, stressLevel, energyLevel, completedToday, totalToday, overdue, timeOfDay } = params;

  const system = `You are a supportive productivity coach inside a task management app.
Write one short, warm, emotionally intelligent motivational message (max 2 sentences, under 120 chars).
Adapt your tone to the user's emotional state. Be human, not robotic.`;

  const user = `Context:
- Time of day: ${timeOfDay}
- Mood: ${mood ?? 'unknown'}
- Stress level: ${Math.round(stressLevel * 100)}%
- Energy level: ${Math.round(energyLevel * 100)}%
- Tasks completed today: ${completedToday} of ${totalToday}
- Overdue tasks: ${overdue}

Write the motivational message now.`;

  return chat(system, user);
}

export async function getAISuggestion(params: {
  mood: string | null;
  stressLevel: number;
  energyLevel: number;
  completedToday: number;
  totalToday: number;
  overdue: number;
  upcomingCount: number;
  criticalPending: number;
  timeOfDay: string;
}): Promise<string> {
  const { mood, stressLevel, energyLevel, completedToday, totalToday, overdue, upcomingCount, criticalPending, timeOfDay } = params;

  const system = `You are an AI productivity assistant inside a task app.
Give one specific, actionable suggestion (max 2 sentences, under 150 chars).
Be direct and practical. No fluff. Adapt to the user's current state.`;

  const user = `Context:
- Time: ${timeOfDay}
- Mood: ${mood ?? 'unknown'}
- Stress: ${Math.round(stressLevel * 100)}%, Energy: ${Math.round(energyLevel * 100)}%
- Done today: ${completedToday}/${totalToday} tasks
- Overdue: ${overdue}, Upcoming deadlines: ${upcomingCount}, Critical pending: ${criticalPending}

Give your suggestion now.`;

  return chat(system, user);
}

export async function getMoodAdvice(mood: string): Promise<string> {
  const system = `You are a warm, emotionally intelligent life coach inside a productivity app.
Give one short, caring piece of advice based on the user's current mood (max 2 sentences, under 140 chars).
Be human, empathetic, and practical. No generic platitudes.`;

  const user = `The user is feeling: ${mood}. Give your advice now.`;
  return chat(system, user);
}

export function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
