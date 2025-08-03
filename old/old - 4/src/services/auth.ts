import { supabase } from './supabase';

export const authService = {
  async signUp(userData: {
    full_name: string;
    date_of_birth: string;
    class_grade: string;
    student_id: string;
    email: string;
    password: string;
  }) {
    // Check if student ID already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('student_id')
      .eq('student_id', userData.student_id)
      .single();

    if (existingProfile) {
      throw new Error('Student ID already exists');
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: userData.full_name,
        date_of_birth: userData.date_of_birth,
        class_grade: userData.class_grade,
        student_id: userData.student_id,
        email: userData.email,
        role: 'student',
        coin_balance: 100,
      });

    if (profileError) throw profileError;

    // Create initial coin transaction
    await supabase
      .from('coin_transactions')
      .insert({
        user_id: authData.user.id,
        amount: 100,
        type: 'initial',
        reason: 'Welcome bonus - initial coins',
      });

    return authData;
  },

  async signIn(studentId: string, password: string) {
    // Handle admin login
    if (studentId === 'LibAdmin' && password === '12qwaszx') {
      // First check if admin user exists
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@library.com',
        password: 'admin123456',
      });

      if (error) {
        throw new Error('Admin account not found. Please contact system administrator.');
      }

      return data;
    }

    // Regular user login - find user by student ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('student_id', studentId)
      .single();

    if (profileError || !profile) {
      throw new Error('Student ID not found');
    }

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getCurrentProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return profile;
  },
};