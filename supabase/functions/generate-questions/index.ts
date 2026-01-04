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
    const { content, questionCount = 5, difficulty = 'medium' } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!content || content.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Nội dung quá ngắn để tạo câu hỏi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Generate questions request:', { contentLength: content.length, questionCount, difficulty });

    const difficultyMap: Record<string, string> = {
      easy: 'dễ, phù hợp với người mới học',
      medium: 'trung bình, yêu cầu hiểu biết cơ bản',
      hard: 'khó, yêu cầu phân tích và suy luận sâu',
    };

    const systemPrompt = `Bạn là chuyên gia tạo câu hỏi trắc nghiệm chất lượng cao.

Nhiệm vụ: Tạo ${questionCount} câu hỏi trắc nghiệm từ nội dung được cung cấp.
Độ khó: ${difficultyMap[difficulty] || difficultyMap.medium}

Yêu cầu:
- Mỗi câu hỏi có 4 đáp án (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Đáp án sai phải hợp lý, không quá dễ nhận ra
- Kèm giải thích ngắn gọn cho đáp án đúng
- Câu hỏi phải kiểm tra sự hiểu biết, không chỉ ghi nhớ`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            { role: "user", parts: [{ text: `Tạo câu hỏi từ nội dung sau:\n\n${content}` }] }
          ],
          tools: [{
            functionDeclarations: [{
              name: "generate_questions",
              description: "Tạo danh sách câu hỏi trắc nghiệm",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question_text: { type: "string", description: "Nội dung câu hỏi" },
                        option_a: { type: "string", description: "Đáp án A" },
                        option_b: { type: "string", description: "Đáp án B" },
                        option_c: { type: "string", description: "Đáp án C" },
                        option_d: { type: "string", description: "Đáp án D" },
                        correct_answer: { type: "string", enum: ["A", "B", "C", "D"], description: "Đáp án đúng" },
                        explanation: { type: "string", description: "Giải thích đáp án" },
                      },
                      required: ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation"],
                    },
                  },
                },
                required: ["questions"],
              },
            }]
          }],
          toolConfig: {
            functionCallingConfig: {
              mode: "ANY",
              allowedFunctionNames: ["generate_questions"]
            }
          }
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

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    // Try to extract questions from different possible response formats
    const parts = data.candidates?.[0]?.content?.parts;

    if (!parts || parts.length === 0) {
      console.error('No parts in response:', data);
      return new Response(JSON.stringify({ error: "Không nhận được phản hồi từ AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try function call format first
    const functionCall = parts[0]?.functionCall;
    if (functionCall?.args?.questions) {
      console.log('Found questions in functionCall.args');
      return new Response(JSON.stringify({ questions: functionCall.args.questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to parse from text response (fallback)
    const textContent = parts[0]?.text;
    if (textContent) {
      console.log('Trying to parse from text content');
      try {
        // Try to extract JSON from text
        const jsonMatch = textContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ questions }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (parseError) {
        console.error('Failed to parse text as JSON:', parseError);
      }
    }

    console.error('Could not extract questions from response:', parts);
    return new Response(JSON.stringify({ error: "Không thể tạo câu hỏi - format không hợp lệ" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate questions error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
