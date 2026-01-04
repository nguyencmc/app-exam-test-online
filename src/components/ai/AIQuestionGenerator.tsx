import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check, Plus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

interface AIQuestionGeneratorProps {
  examId?: string;
  onQuestionsGenerated?: (questions: GeneratedQuestion[]) => void;
}

export const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({
  examId,
  onQuestionsGenerated
}) => {
  const [content, setContent] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const generateQuestions = async () => {
    if (content.trim().length < 50) {
      toast({
        title: 'Nội dung quá ngắn',
        description: 'Vui lòng nhập ít nhất 50 ký tự nội dung để tạo câu hỏi.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedQuestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          content,
          questionCount: parseInt(questionCount),
          difficulty
        },
      });

      if (error) throw error;

      if (data.questions) {
        setGeneratedQuestions(data.questions);
        setSelectedQuestions(new Set(data.questions.map((_: any, i: number) => i)));
        toast({
          title: 'Thành công',
          description: `Đã tạo ${data.questions.length} câu hỏi!`,
        });
      }
    } catch (error) {
      console.error('Generate questions error:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const handleAddQuestions = () => {
    const selected = generatedQuestions.filter((_, i) => selectedQuestions.has(i));
    onQuestionsGenerated?.(selected);
    toast({
      title: 'Thành công',
      description: `Đã thêm ${selected.length} câu hỏi vào bài thi!`,
    });
    setGeneratedQuestions([]);
    setContent('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Tạo câu hỏi bằng AI
        </CardTitle>
        <CardDescription>
          Nhập nội dung bài học và AI sẽ tự động tạo câu hỏi trắc nghiệm
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Dán nội dung bài học vào đây... (tối thiểu 50 ký tự)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="resize-none"
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">Số câu hỏi</label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n} câu</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">Độ khó</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateQuestions}
          disabled={isLoading || content.length < 50}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo câu hỏi...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Tạo câu hỏi
            </>
          )}
        </Button>

        {generatedQuestions.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Câu hỏi được tạo ({generatedQuestions.length})</h4>
              <Badge variant="secondary">
                {selectedQuestions.size} được chọn
              </Badge>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedQuestions.map((q, idx) => (
                <Card
                  key={idx}
                  className={`cursor-pointer transition-all ${selectedQuestions.has(idx)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                    }`}
                  onClick={() => toggleQuestion(idx)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedQuestions.has(idx)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground'
                        }`}>
                        {selectedQuestions.has(idx) && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-2">{q.question_text}</p>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className={`p-1.5 rounded ${q.correct_answer === 'A' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                            A. {q.option_a}
                          </div>
                          <div className={`p-1.5 rounded ${q.correct_answer === 'B' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                            B. {q.option_b}
                          </div>
                          <div className={`p-1.5 rounded ${q.correct_answer === 'C' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                            C. {q.option_c}
                          </div>
                          <div className={`p-1.5 rounded ${q.correct_answer === 'D' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                            D. {q.option_d}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 {q.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {onQuestionsGenerated && (
              <Button
                onClick={handleAddQuestions}
                disabled={selectedQuestions.size === 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm {selectedQuestions.size} câu hỏi vào bài thi
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
