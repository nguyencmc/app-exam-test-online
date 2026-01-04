import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'moderator' | 'teacher' | 'user';

interface UserRoleResult {
  roles: AppRole[];
  isAdmin: boolean;
  isTeacher: boolean;
  isModerator: boolean;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
}

export const useUserRole = (): UserRoleResult => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching roles:', error);
          setRoles([]);
        } else {
          setRoles((data || []).map(r => r.role as AppRole));
        }
      } catch (err) {
        console.error('Error:', err);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => roles.includes(role);

  return {
    roles,
    isAdmin: hasRole('admin'),
    isTeacher: hasRole('teacher'),
    isModerator: hasRole('moderator'),
    loading,
    hasRole,
  };
};
