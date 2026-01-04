import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('AI Tutor request received:', { messagesCount: messages?.length, hasContext: !!context });

    const systemPrompt = `Bạn là một gia sư AI thông minh và thân thiện, chuyên hỗ trợ học sinh học tập.

Nhiệm vụ của bạn:
- Trả lời câu hỏi về bài học một cách rõ ràng và dễ hiểu
- Giải thích các khái niệm phức tạp bằng ví dụ thực tế
- Khuyến khích học sinh tự suy nghĩ và tìm tòi
- Đưa ra gợi ý học tập và phương pháp ôn thi hiệu quả
- Sử dụng ngôn ngữ thân thiện, phù hợp với học sinh

${context ? `Ngữ cảnh bài học hiện tại:\n${context}` : ''}

Hãy trả lời bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin.`;

    // Convert OpenAI-style messages to Gemini format
    const geminiContents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: geminiContents,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(JSON.stringify({ error: "API key không hợp lệ hoặc đã hết quota." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Lỗi Gemini API" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE stream to OpenAI-compatible format for frontend compatibility
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr.trim() === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  continue;
                }
                try {
                  const geminiData = JSON.parse(jsonStr);
                  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (text) {
                    // Convert to OpenAI-compatible SSE format
                    const openAIFormat = {
                      choices: [{
                        delta: { content: text },
                        index: 0,
                        finish_reason: null
                      }]
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIFormat)}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Tutor error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
