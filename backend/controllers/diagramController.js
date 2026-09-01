import Groq from "groq-sdk";

export const generateDiagramFromPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Please provide an architecture description prompt." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Groq API key is not configured." });
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `You are a world-class principal software systems architect and master teacher.
Generate visually structured, clean, tiered software architecture diagrams.

CRITICAL STRUCTURAL RULES (AVOID RANDOM SCATTERING):
1. Organize the architecture in strict, logical vertical tiers:
   - Tier 1: User / Client / External Trigger (e.g. circleNode / Web Browser)
   - Tier 2: Traffic Routing & Gateways (e.g. archNode / Load Balancer, Nginx, API Gateway)
   - Tier 3: Core Business Logic & Decision Checks (e.g. archNode / Node.js Express, decisionNode / Validation check)
   - Tier 4: Data, Caching & Asynchronous Buffers (e.g. dbNode / PostgreSQL, archNode / Redis, queueNode / Kafka)
2. Every node MUST have sequential steps (1, 2, 3, 4...).
3. Edges MUST connect clearly from parent tier to child tier (e.g. node-1 -> node-2 -> node-3 -> node-4).
4. For branching decisions (decisionNode), route cleanly to (a) Success path and (b) Failure/Fallback path.
5. Every Arrow MUST have an action label (e.g. "1. HTTPS Request", "2. Cache Check", "3. SQL Query", "4. Returns JSON Response").

AVAILABLE NODE TYPES:
- "circleNode" → For Users, Clients, Actors, Webhook Triggers
- "archNode" → For API Servers, Microservices, Load Balancers, Workers
- "decisionNode" → For Branching Logic & Validations (e.g. "Cache Hit?", "Token Valid?")
- "queueNode" → For Message Brokers & Streams (Kafka, SQS, RabbitMQ)
- "dbNode" → For Persistent Databases (PostgreSQL, MongoDB, DynamoDB)

OUTPUT SCHEMA (RAW JSON ONLY):
{
  "title": "Clear Concept Title (e.g. How a User Request Flows Through the System)",
  "keyIdea": "Concise 1-sentence takeaway explaining the core concept",
  "nodes": [
    {
      "id": "node-1",
      "type": "circleNode" | "archNode" | "decisionNode" | "queueNode" | "dbNode",
      "step": 1,
      "label": "Human-readable Name",
      "subtitle": "Plain-English role: what it does & why it exists",
      "techBadge": "Exact tech (e.g. React & Vite, AWS ALB, Node.js Express, PostgreSQL, Redis)",
      "technology": "react" | "nextjs" | "nodejs" | "python" | "go" | "postgres" | "mongodb" | "redis" | "kafka" | "docker" | "kubernetes" | "aws" | "nginx" | "graphql" | "generic",
      "color": "indigo" | "emerald" | "amber" | "rose" | "cyan" | "slate"
    }
  ],
  "edges": [
    {
      "id": "e-1-2",
      "source": "node-1",
      "target": "node-2",
      "label": "Action / Protocol (e.g. 1. HTTPS Request, 2. If valid -> SQL Query, 3. Returns Response)"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a clean, tiered, structured architecture diagram for: ${prompt.trim()}` }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2048
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    
    // Extract JSON boundary
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      raw = match[0];
    }

    const parsed = JSON.parse(raw);

    const nodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
    const edges = Array.isArray(parsed.edges) ? parsed.edges : [];

    return res.json({
      success: true,
      diagram: {
        title: parsed.title || "System Architecture Flow",
        keyIdea: parsed.keyIdea || "",
        nodes,
        edges
      }
    });
  } catch (error) {
    console.error("Structured Diagram Generation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate structured diagram." });
  }
};
