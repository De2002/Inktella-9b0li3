import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, content, author } = await req.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing poem title or content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are a literary critic with a warm, insightful voice. Analyze the following poem.

Title: "${title}"
${author ? `Author: ${author}` : ''}

---
${content}
---

Provide a concise but rich analysis in these sections:

**Tone & Mood** — What emotional register does this poem inhabit? How does it feel to read?

**Imagery & Language** — Identify 1–2 specific images or word choices that do the most work. Why are they effective?

**Structure & Form** — Comment on line breaks, rhythm, stanza choices, or white space. What do they contribute?

**What Stays With You** — One sentence: the lasting impression, question, or feeling the poem leaves behind.

Keep the total response under 280 words. Write with clarity and genuine appreciation for the craft.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful literary critic who writes accessible, insightful poetry analysis. You care deeply about language and help readers see poems more deeply.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API error:', errText);
      return new Response(
        JSON.stringify({ error: `AI: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content ?? '';

    console.log(`Analyzed poem: "${title}" (${content.length} chars)`);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('analyze-poem error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
