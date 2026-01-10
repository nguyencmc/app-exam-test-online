// Migration script: Supabase → RDS
// Run with: npx ts-node scripts/migrate-data.ts

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SupabaseExam {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    description: string | null;
    question_count: number;
    duration_minutes: number;
    attempt_count: number;
    difficulty: string;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

interface SupabaseQuestion {
    id: string;
    exam_id: string;
    question_text: string;
    option_a: string | null;
    option_b: string | null;
    option_c: string | null;
    option_d: string | null;
    option_e: string | null;
    option_f: string | null;
    correct_answer: string;
    explanation: string | null;
    question_order: number;
}

interface SupabaseCategory {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

interface SupabaseCourse {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    subcategory: string | null;
    thumbnail_url: string | null;
    is_official: boolean;
    created_at: string;
    updated_at: string;
}

interface SupabaseFlashcardSet {
    id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

interface SupabaseFlashcard {
    id: string;
    set_id: string;
    front: string;
    back: string;
    card_order: number;
}

async function loadJson<T>(filename: string): Promise<T[]> {
    const filepath = path.join('/tmp/supabase_export', filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
}

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate Categories
    console.log('\n1. Migrating Categories...');
    const categories = await loadJson<SupabaseCategory>('exam_categories.json');
    for (const cat of categories) {
        await prisma.examCategory.upsert({
            where: { id: cat.id },
            create: {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                createdAt: new Date(cat.created_at),
            },
            update: { name: cat.name, slug: cat.slug },
        });
    }
    console.log(`  ✓ ${categories.length} categories migrated`);

    // 2. Migrate Exams
    console.log('\n2. Migrating Exams...');
    const exams = await loadJson<SupabaseExam>('exams.json');
    for (const exam of exams) {
        await prisma.exam.upsert({
            where: { id: exam.id },
            create: {
                id: exam.id,
                title: exam.title,
                slug: exam.slug,
                description: exam.description,
                durationMinutes: exam.duration_minutes,
                difficulty: exam.difficulty,
                isPublished: true,
                questionCount: exam.question_count,
                attemptCount: exam.attempt_count,
                categoryId: exam.category_id,
                createdAt: new Date(exam.created_at),
                updatedAt: new Date(exam.updated_at),
            },
            update: {
                title: exam.title,
                description: exam.description,
                durationMinutes: exam.duration_minutes,
            },
        });
    }
    console.log(`  ✓ ${exams.length} exams migrated`);

    // 3. Migrate Questions
    console.log('\n3. Migrating Questions...');
    const questions = await loadJson<SupabaseQuestion>('questions.json');
    for (const q of questions) {
        await prisma.question.upsert({
            where: { id: q.id },
            create: {
                id: q.id,
                examId: q.exam_id,
                questionText: q.question_text,
                optionA: q.option_a,
                optionB: q.option_b,
                optionC: q.option_c,
                optionD: q.option_d,
                optionE: q.option_e,
                optionF: q.option_f,
                correctAnswer: q.correct_answer,
                explanation: q.explanation,
                orderIndex: q.question_order || 0,
            },
            update: { questionText: q.question_text },
        });
    }
    console.log(`  ✓ ${questions.length} questions migrated`);

    // 4. Migrate Courses
    console.log('\n4. Migrating Courses...');
    const courses = await loadJson<SupabaseCourse>('courses.json');
    for (const course of courses) {
        await prisma.course.upsert({
            where: { id: course.id },
            create: {
                id: course.id,
                title: course.title,
                description: course.description,
                category: course.category,
                subcategory: course.subcategory,
                thumbnail: course.thumbnail_url,
                isOfficial: course.is_official,
                createdAt: new Date(course.created_at),
                updatedAt: new Date(course.updated_at),
            },
            update: { title: course.title },
        });
    }
    console.log(`  ✓ ${courses.length} courses migrated`);

    // 5. Migrate Flashcard Sets
    console.log('\n5. Migrating Flashcard Sets...');
    const sets = await loadJson<SupabaseFlashcardSet>('flashcard_sets.json');
    for (const set of sets) {
        await prisma.flashcardSet.upsert({
            where: { id: set.id },
            create: {
                id: set.id,
                title: set.title,
                description: set.description,
                isPublic: set.is_public,
                createdAt: new Date(set.created_at),
                updatedAt: new Date(set.updated_at),
            },
            update: { title: set.title },
        });
    }
    console.log(`  ✓ ${sets.length} flashcard sets migrated`);

    // 6. Migrate Flashcards
    console.log('\n6. Migrating Flashcards...');
    const flashcards = await loadJson<SupabaseFlashcard>('flashcards.json');
    for (const card of flashcards) {
        await prisma.flashcard.upsert({
            where: { id: card.id },
            create: {
                id: card.id,
                setId: card.set_id,
                front: card.front,
                back: card.back,
                cardOrder: card.card_order || 0,
            },
            update: { front: card.front, back: card.back },
        });
    }
    console.log(`  ✓ ${flashcards.length} flashcards migrated`);

    console.log('\n✅ Migration complete!');
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
