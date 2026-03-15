import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const { skill, difficulty } = await request.json();

    if (!skill) {
      return NextResponse.json({ error: "Skill is required" }, { status: 400 });
    }

    const level = difficulty || "intermediate";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a technical interviewer. Generate a skill verification challenge for "${skill}" at ${level} level. Return JSON with this exact format:
{
  "question": "A practical coding/design/technical question",
  "hint": "A small hint to guide the answer",
  "evaluationCriteria": ["criterion 1", "criterion 2", "criterion 3"],
  "timeLimit": 300,
  "difficulty": "${level}"
}
The question should be practical and testable — something that proves real-world ability, not trivia. Keep it concise (1-3 sentences). Return ONLY valid JSON.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 });
    }

    const challenge = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ challenge });
  } catch (error) {
    console.error("Skill challenge error:", error);
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const { skill, question, answer, evaluationCriteria } = await request.json();

    if (!skill || !question || !answer) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are evaluating a skill verification challenge answer. The skill is "${skill}".

Question: ${question}
Evaluation criteria: ${JSON.stringify(evaluationCriteria)}
Candidate's answer: ${answer}

Evaluate the answer and return JSON:
{
  "passed": true/false,
  "score": 0-100,
  "level": "beginner" | "intermediate" | "advanced",
  "feedback": "1-2 sentence feedback",
  "strengths": ["strength 1"],
  "improvements": ["improvement 1"]
}
Be fair but rigorous. A passing score is 60+. Return ONLY valid JSON.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to evaluate" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Skill evaluation error:", error);
    return NextResponse.json({ error: "Failed to evaluate" }, { status: 500 });
  }
}
