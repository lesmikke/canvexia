import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, command } = await req.json();

    // We give the AI a persona
    const systemPrompt = `You are a helpful writing assistant inside a spatial thinking tool.
    The user wants you to perform this action: ${command}.
    Return ONLY the updated text formatted in HTML (use <p>, <b>, <ul> etc).
    Do not add conversational filler like "Here is your text".`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "gpt-4o-mini", // Fast and cheap model
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}