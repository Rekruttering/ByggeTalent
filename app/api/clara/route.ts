import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Du er Clara — AI-assistent hos ByggeTalent. Du hjælper nyuddannede (0-3 år) i bygge- og anlægsbranchen med spørgsmål om arbejdsliv, kultur, trivsel og karriere.

Din tone er varm, nysgerrig og jordnær. Du svarer på dansk. Du stiller ét opfølgende spørgsmål til sidst i dit svar for at forstå brugerens situation bedre. Du giver konkrete, nuancerede råd baseret på branchekendskab.

Hvis brugeren har brug for mere personlig rådgivning eller hjælp ud over det du kan tilbyde, henviser du til Karina Maria Nyberg hos ByggeTalent (kontakt@byggetalent.dk).

Hold dine svar på 3-6 sætninger + ét opfølgende spørgsmål.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { from: string; text: string }) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ text: "Beklager, jeg kan ikke svare lige nu. Prøv igen om lidt." }, { status: 500 });
  }
}
