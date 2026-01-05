import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services";
import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useAdminExams = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [viewMode, setViewMode] = useState<"table" | "card">("table");
    const [selectedExams, setSelectedExams] = useState<string[]>([]);

    // Fetch Exams
    const { data: exams, isLoading: examsLoading } = useQuery({
        queryKey: ["admin-exams"],
        queryFn: async () => {
            return await examService.getAdminExams();
        },
    });

    // Fetch Categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ["exam-categories"],
        queryFn: async () => {
            const { data } = await supabase.from("exam_categories").select("*");
            return (data || []) as ExamCategory[];
        },
    });

    // Mutations
    const deleteExamMutation = useMutation({
        mutationFn: async (id: string) => {
            await examService.deleteExamWithQuestions(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
            toast({ title: "Thành công", description: "Đã xóa đề thi" });
        },
        onError: () => {
            toast({ title: "Lỗi", description: "Không thể xóa đề thi", variant: "destructive" });
        }
    });

    const duplicateExamMutation = useMutation({
        mutationFn: async (exam: Exam) => {
            return await examService.duplicateExam(exam);
        },
        onSuccess: (newExam) => {
            queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
            toast({ title: "Thành công", description: "Đã sao chép đề thi" });
        },
        onError: () => {
            toast({ title: "Lỗi", description: "Không thể sao chép đề thi", variant: "destructive" });
        }
    });

    // Selection Logic
    const toggleSelectExam = useCallback((examId: string) => {
        setSelectedExams(prev =>
            prev.includes(examId)
                ? prev.filter(id => id !== examId)
                : [...prev, examId]
        );
    }, []);

    const toggleSelectAll = useCallback((filteredIds: string[]) => {
        if (selectedExams.length === filteredIds.length && filteredIds.length > 0) {
            setSelectedExams([]);
        } else {
            setSelectedExams(filteredIds);
        }
    }, [selectedExams]);

    const handleBulkDelete = async () => {
        if (selectedExams.length === 0) return;

        try {
            // Sequential delete to ensure constraints are handled
            for (const id of selectedExams) {
                await examService.deleteExamWithQuestions(id);
            }
            queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
            setSelectedExams([]);
            toast({ title: "Thành công", description: `Đã xóa ${selectedExams.length} đề thi` });
        } catch (error) {
            toast({ title: "Lỗi", description: "Có lỗi khi xóa nhiều đề thi", variant: "destructive" });
        }
    };

    // Filter Logic
    const filteredExams = exams?.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exam.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesCategory = selectedCategory === "all" || exam.category_id === selectedCategory;
        const matchesDifficulty = selectedDifficulty === "all" || exam.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
    }) || [];

    return {
        // Data
        exams: filteredExams,
        allExams: exams || [], // For stats
        categories: categories || [],
        isLoading: examsLoading || categoriesLoading,

        // State
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedDifficulty,
        setSelectedDifficulty,
        viewMode,
        setViewMode,
        selectedExams,

        // Actions
        toggleSelectExam,
        toggleSelectAll,
        handleDelete: (id: string) => deleteExamMutation.mutate(id),
        handleDuplicate: (exam: Exam) => duplicateExamMutation.mutate(exam),
        handleBulkDelete,
    };
};
