import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export async function signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return {
    user: data.user
      ? { id: data.user.id, email: data.user.email || '', role: undefined }
      : null,
    error: null,
  };
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    const role = await getUserRole(data.user.id);
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        role,
      },
      error: null,
    };
  }

  return { user: null, error: 'Authentication failed' };
}

export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const role = await getUserRole(user.id);

  return {
    id: user.id,
    email: user.email || '',
    role,
  };
}

export async function getUserRole(userId: string): Promise<string | undefined> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    return undefined;
  }

  return data?.role;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const role = await getUserRole(session.user.id);
      callback({
        id: session.user.id,
        email: session.user.email || '',
        role,
      });
    } else {
      callback(null);
    }
  });

  return subscription;
}
