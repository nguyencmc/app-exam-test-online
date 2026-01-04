import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  File,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Question {
  id?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  option_f: string;
  option_g: string;
  option_h: string;
  correct_answer: string;
  explanation: string;
  question_order: number;
}

interface ImportExportQuestionsProps {
  questions: Question[];
  onImport: (questions: Question[]) => void;
}

export const ImportExportQuestions = ({ questions, onImport }: ImportExportQuestionsProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Parse CSV content
  const parseCSV = (content: string): Question[] => {
    const lines = content.trim().split('\n');
    const result: Question[] = [];
    
    // Skip header if exists
    const startIndex = lines[0]?.toLowerCase().includes('question') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle quoted CSV fields
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());
      
      if (fields.length >= 6) {
        result.push({
          question_text: fields[0] || '',
          option_a: fields[1] || '',
          option_b: fields[2] || '',
          option_c: fields[3] || '',
          option_d: fields[4] || '',
          option_e: fields[5] || '',
          option_f: fields[6] || '',
          option_g: fields[7] || '',
          option_h: fields[8] || '',
          correct_answer: (fields[9] || fields[5] || 'A').toUpperCase(),
          explanation: fields[10] || fields[6] || '',
          question_order: result.length + 1,
        });
      }
    }
    
    return result;
  };

  // Parse TXT content (one question per block, separated by empty lines)
  const parseTXT = (content: string): Question[] => {
    const blocks = content.split(/\n\s*\n/);
    const result: Question[] = [];
    
    for (const block of blocks) {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 3) continue;
      
      // Find where the question ends and options begin
      // Question starts with "Question", "Câu", "Câu hỏi", "Q", or number pattern
      // Options start with A. B. C. etc.
      const questionLines: string[] = [];
      let optionStartIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check if this line starts an option (A. A) A: etc.)
        if (/^[A-Ha-h][.):]\s*\S/.test(line) || /^\*\s*[A-Ha-h][.):]/i.test(line) || /^\[x\]\s*[A-Ha-h][.):]/i.test(line)) {
          optionStartIndex = i;
          break;
        }
        questionLines.push(line);
      }
      
      if (optionStartIndex === -1 || questionLines.length === 0) continue;
      
      // Join all question lines and clean up the question prefix
      let questionText = questionLines.join(' ');
      // Remove common prefixes like "Question 1:", "Câu 1:", "Câu hỏi 1:", "Q1:", etc.
      questionText = questionText.replace(/^(?:Question|Câu\s*hỏi|Câu|Q)\s*\d*[.:)]\s*/i, '').trim();
      
      let optionA = '', optionB = '', optionC = '', optionD = '';
      let optionE = '', optionF = '', optionG = '', optionH = '';
      let correctAnswer = 'A';
      let explanation = '';
      
      for (let i = optionStartIndex; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for correct answer marker (*, [x], ✓, (correct))
        const isCorrect = /^\*|^\[x\]|✓|✔|\(correct\)|\(đúng\)/i.test(line);
        const cleanLine = line.replace(/^\*|\[x\]|✓|✔|\(correct\)|\(đúng\)/gi, '').trim();
        
        // Match options A-H with various formats: A. A) A:
        const optionMatch = cleanLine.match(/^([A-Ha-h])[.:)]\s*(.+)/);
        
        if (optionMatch) {
          const letter = optionMatch[1].toUpperCase();
          const text = optionMatch[2].trim();
          
          if (letter === 'A') optionA = text;
          if (letter === 'B') optionB = text;
          if (letter === 'C') optionC = text;
          if (letter === 'D') optionD = text;
          if (letter === 'E') optionE = text;
          if (letter === 'F') optionF = text;
          if (letter === 'G') optionG = text;
          if (letter === 'H') optionH = text;
          
          if (isCorrect) correctAnswer = letter;
        } else if (/^(Giải thích|Explanation|Answer)[.:]/i.test(cleanLine)) {
          explanation = cleanLine.replace(/^(Giải thích|Explanation|Answer)[.:]\s*/i, '');
        } else if (/^(Đáp án|Correct|Đáp án đúng)[.:]\s*([A-Ha-h])/i.test(cleanLine)) {
          const match = cleanLine.match(/([A-Ha-h])/i);
          if (match) correctAnswer = match[1].toUpperCase();
        }
      }
      
      if (questionText && optionA && optionB) {
        result.push({
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          option_e: optionE,
          option_f: optionF,
          option_g: optionG,
          option_h: optionH,
          correct_answer: correctAnswer,
          explanation,
          question_order: result.length + 1,
        });
      }
    }
    
    return result;
  };

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    
    try {
      const content = await file.text();
      let parsedQuestions: Question[] = [];
      
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.csv')) {
        parsedQuestions = parseCSV(content);
      } else if (fileName.endsWith('.txt')) {
        parsedQuestions = parseTXT(content);
      } else if (fileName.endsWith('.json')) {
        const jsonData = JSON.parse(content);
        const questionsArray = Array.isArray(jsonData) ? jsonData : jsonData.questions || [];
        parsedQuestions = questionsArray.map((q: any, index: number) => ({
          question_text: q.question_text || q.question || q.text || '',
          option_a: q.option_a || q.optionA || q.options?.[0] || q.a || '',
          option_b: q.option_b || q.optionB || q.options?.[1] || q.b || '',
          option_c: q.option_c || q.optionC || q.options?.[2] || q.c || '',
          option_d: q.option_d || q.optionD || q.options?.[3] || q.d || '',
          option_e: q.option_e || q.optionE || q.options?.[4] || q.e || '',
          option_f: q.option_f || q.optionF || q.options?.[5] || q.f || '',
          option_g: q.option_g || q.optionG || q.options?.[6] || q.g || '',
          option_h: q.option_h || q.optionH || q.options?.[7] || q.h || '',
          correct_answer: (q.correct_answer || q.correctAnswer || q.answer || 'A').toUpperCase(),
          explanation: q.explanation || '',
          question_order: index + 1,
        }));
      } else {
        throw new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng CSV, TXT hoặc JSON.');
      }
      
      if (parsedQuestions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi hợp lệ trong file.');
      }
      
      onImport([...questions, ...parsedQuestions]);
      
      toast({
        title: "Import thành công",
        description: `Đã thêm ${parsedQuestions.length} câu hỏi`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi import",
        description: error.message || "Không thể đọc file",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle manual import from dialog
  const handleManualImport = () => {
    try {
      let parsedQuestions: Question[] = [];
      
      // Try to detect format
      const trimmedInput = manualInput.trim();
      
      if (trimmedInput.startsWith('[') || trimmedInput.startsWith('{')) {
        // JSON format
        const jsonData = JSON.parse(trimmedInput);
        const questionsArray = Array.isArray(jsonData) ? jsonData : jsonData.questions || [];
        parsedQuestions = questionsArray.map((q: any, index: number) => ({
          question_text: q.question_text || q.question || q.text || '',
          option_a: q.option_a || q.optionA || q.options?.[0] || q.a || '',
          option_b: q.option_b || q.optionB || q.options?.[1] || q.b || '',
          option_c: q.option_c || q.optionC || q.options?.[2] || q.c || '',
          option_d: q.option_d || q.optionD || q.options?.[3] || q.d || '',
          option_e: q.option_e || q.optionE || q.options?.[4] || q.e || '',
          option_f: q.option_f || q.optionF || q.options?.[5] || q.f || '',
          option_g: q.option_g || q.optionG || q.options?.[6] || q.g || '',
          option_h: q.option_h || q.optionH || q.options?.[7] || q.h || '',
          correct_answer: (q.correct_answer || q.correctAnswer || q.answer || 'A').toUpperCase(),
          explanation: q.explanation || '',
          question_order: questions.length + index + 1,
        }));
      } else if (trimmedInput.includes(',')) {
        // CSV format
        parsedQuestions = parseCSV(trimmedInput);
      } else {
        // TXT format
        parsedQuestions = parseTXT(trimmedInput);
      }
      
      if (parsedQuestions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi hợp lệ.');
      }
      
      // Update question order
      parsedQuestions = parsedQuestions.map((q, i) => ({
        ...q,
        question_order: questions.length + i + 1,
      }));
      
      onImport([...questions, ...parsedQuestions]);
      setShowManualDialog(false);
      setManualInput('');
      
      toast({
        title: "Import thành công",
        description: `Đã thêm ${parsedQuestions.length} câu hỏi`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi import",
        description: error.message || "Không thể parse dữ liệu",
        variant: "destructive",
      });
    }
  };

  // Export functions
  const exportToCSV = () => {
    const header = 'Question,Option A,Option B,Option C,Option D,Option E,Option F,Option G,Option H,Correct Answer,Explanation';
    const rows = questions.map(q => 
      `"${q.question_text.replace(/"/g, '""')}","${q.option_a.replace(/"/g, '""')}","${q.option_b.replace(/"/g, '""')}","${q.option_c.replace(/"/g, '""')}","${q.option_d.replace(/"/g, '""')}","${(q.option_e || '').replace(/"/g, '""')}","${(q.option_f || '').replace(/"/g, '""')}","${(q.option_g || '').replace(/"/g, '""')}","${(q.option_h || '').replace(/"/g, '""')}","${q.correct_answer}","${q.explanation.replace(/"/g, '""')}"`
    );
    
    const csv = [header, ...rows].join('\n');
    downloadFile(csv, 'questions.csv', 'text/csv');
  };

  const exportToTXT = () => {
    const content = questions.map((q, index) => {
      let text = `Question ${index + 1}: ${q.question_text}\n`;
      text += `A. ${q.option_a}\n`;
      text += `B. ${q.option_b}\n`;
      if (q.option_c) text += `C. ${q.option_c}\n`;
      if (q.option_d) text += `D. ${q.option_d}\n`;
      if (q.option_e) text += `E. ${q.option_e}\n`;
      if (q.option_f) text += `F. ${q.option_f}\n`;
      if (q.option_g) text += `G. ${q.option_g}\n`;
      if (q.option_h) text += `H. ${q.option_h}\n`;
      text += `Correct: ${q.correct_answer}\n`;
      if (q.explanation) text += `Explanation: ${q.explanation}\n`;
      return text;
    }).join('\n');
    
    downloadFile(content, 'questions.txt', 'text/plain');
  };

  const exportToJSON = () => {
    const json = JSON.stringify(questions, null, 2);
    downloadFile(json, 'questions.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export thành công",
      description: `Đã tải file ${filename}`,
    });
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv,.txt,.json"
        onChange={handleFileImport}
      />
      
      <div className="flex gap-2">
        {/* Import Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={importing}>
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Import
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Chọn nguồn import</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Từ file (CSV, TXT, JSON)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowManualDialog(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Nhập thủ công
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={questions.length === 0}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Chọn định dạng</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportToCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV (Excel)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToTXT}>
              <FileText className="w-4 h-4 mr-2" />
              TXT (Text)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToJSON}>
              <File className="w-4 h-4 mr-2" />
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Manual Input Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nhập câu hỏi thủ công</DialogTitle>
            <DialogDescription>
              Hỗ trợ các định dạng: JSON, CSV, hoặc TXT. Hỗ trợ tối đa 8 đáp án (A-H).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="manual-input">Nội dung câu hỏi</Label>
              <Textarea
                id="manual-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={`Ví dụ TXT:\n\nQuestion 1: Thủ đô Việt Nam là gì?\nA. Hà Nội\nB. Hồ Chí Minh\nC. Đà Nẵng\nD. Huế\nE. Hải Phòng\nF. Cần Thơ\nCorrect: A\nExplanation: Hà Nội là thủ đô của Việt Nam\n\nVí dụ CSV:\nThủ đô Việt Nam là gì?,Hà Nội,Hồ Chí Minh,Đà Nẵng,Huế,,,,,A,Hà Nội là thủ đô`}
                rows={12}
              />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Hướng dẫn định dạng:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>TXT:</strong> Mỗi câu hỏi cách nhau bằng dòng trống. Câu hỏi bắt đầu bằng "Question" hoặc "Câu". Đáp án A-H trên từng dòng.</li>
                <li><strong>CSV:</strong> Câu hỏi, Đáp án A, B, C, D, E, F, G, H, Đáp án đúng, Giải thích (phân cách bởi dấu phẩy)</li>
                <li><strong>JSON:</strong> Mảng objects với các trường question_text, option_a đến option_h, correct_answer, explanation</li>
                <li><strong>Đáp án đúng:</strong> Đánh dấu bằng *, [x], hoặc dòng "Correct: A" / "Đáp án: A"</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowManualDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleManualImport} disabled={!manualInput.trim()}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};