// Shared Module - Barrel Export
// Common utilities and components used across all modules

// Note: These exports point to original locations until files are moved
// After migration, update to ./components/*, ./hooks/*, etc.

// Re-export from original locations for backwards compatibility
export { cn } from '@/lib/utils';
export { supabase } from '@/integrations/supabase/client';

// Use toast hook
export { useToast, toast } from '@/hooks/use-toast';
export { useMobile } from '@/hooks/use-mobile';

// Types
export type {
    PaginatedResponse,
    PaginationParams,
    ApiError,
    SelectOption,
    UserProgress,
    Result,
} from './types/common.types';
