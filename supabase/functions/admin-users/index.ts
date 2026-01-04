import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  role?: string;
  expires_at?: string;
}

interface BulkCreateRequest {
  users: CreateUserRequest[];
}

interface UpdatePasswordRequest {
  user_id: string;
  new_password: string;
}

interface DeleteUserRequest {
  user_id: string;
}

interface UpdateUserRequest {
  user_id: string;
  role?: string;
  expires_at?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !requestingUser) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is admin
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'admin');

    if (roleError || !roles || roles.length === 0) {
      console.error('User is not admin:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log(`Admin action: ${action} by user: ${requestingUser.id}`);

    switch (action) {
      case 'create': {
        const body: CreateUserRequest = await req.json();
        console.log('Creating user:', body.email);
        
        // Create user in auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
          user_metadata: {
            full_name: body.full_name || ''
          }
        });

        if (createError) {
          console.error('Error creating user:', createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update profile with expires_at if provided
        if (body.expires_at && newUser.user) {
          await supabaseAdmin
            .from('profiles')
            .update({ expires_at: body.expires_at })
            .eq('user_id', newUser.user.id);
        }

        // Add role if provided
        if (body.role && body.role !== 'user' && newUser.user) {
          await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: newUser.user.id, role: body.role });
        }

        console.log('User created successfully:', newUser.user?.id);
        return new Response(
          JSON.stringify({ success: true, user: newUser.user }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'bulk-create': {
        const body: BulkCreateRequest = await req.json();
        console.log('Bulk creating users:', body.users.length);
        
        const results: { email: string; success: boolean; error?: string }[] = [];

        for (const userData of body.users) {
          try {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
              user_metadata: {
                full_name: userData.full_name || ''
              }
            });

            if (createError) {
              results.push({ email: userData.email, success: false, error: createError.message });
              continue;
            }

            // Update profile with expires_at if provided
            if (userData.expires_at && newUser.user) {
              await supabaseAdmin
                .from('profiles')
                .update({ expires_at: userData.expires_at })
                .eq('user_id', newUser.user.id);
            }

            // Add role if provided
            if (userData.role && userData.role !== 'user' && newUser.user) {
              await supabaseAdmin
                .from('user_roles')
                .insert({ user_id: newUser.user.id, role: userData.role });
            }

            results.push({ email: userData.email, success: true });
          } catch (err) {
            results.push({ email: userData.email, success: false, error: String(err) });
          }
        }

        console.log('Bulk create completed:', results);
        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const body: DeleteUserRequest = await req.json();
        console.log('Deleting user:', body.user_id);

        // Prevent self-deletion
        if (body.user_id === requestingUser.id) {
          return new Response(
            JSON.stringify({ error: 'Cannot delete yourself' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(body.user_id);

        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('User deleted successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update-password': {
        const body: UpdatePasswordRequest = await req.json();
        console.log('Updating password for user:', body.user_id);

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          body.user_id,
          { password: body.new_password }
        );

        if (updateError) {
          console.error('Error updating password:', updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Password updated successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        const body: UpdateUserRequest = await req.json();
        console.log('Updating user:', body.user_id);

        // Update role if provided
        if (body.role !== undefined) {
          // Delete existing roles
          await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', body.user_id);

          // Add new role if not 'user'
          if (body.role && body.role !== 'user') {
            await supabaseAdmin
              .from('user_roles')
              .insert({ user_id: body.user_id, role: body.role });
          }
        }

        // Update expires_at if provided
        if (body.expires_at !== undefined) {
          await supabaseAdmin
            .from('profiles')
            .update({ expires_at: body.expires_at })
            .eq('user_id', body.user_id);
        }

        console.log('User updated successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        console.log('Listing all users');
        
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
          console.error('Error listing users:', listError);
          return new Response(
            JSON.stringify({ error: listError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get all profiles with expires_at
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('user_id, expires_at, full_name, username, email');

        // Get all roles
        const { data: allRoles } = await supabaseAdmin
          .from('user_roles')
          .select('user_id, role');

        const enrichedUsers = users.map(user => {
          const profile = profiles?.find(p => p.user_id === user.id);
          const userRoles = allRoles?.filter(r => r.user_id === user.id).map(r => r.role) || [];
          return {
            ...user,
            profile,
            roles: userRoles
          };
        });

        return new Response(
          JSON.stringify({ success: true, users: enrichedUsers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in admin-users function:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
