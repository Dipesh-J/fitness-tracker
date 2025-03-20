import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Exercise = {
  id?: string;
  name: string;
  bodyPart: string;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  created_at?: string;
  user_id?: string;
};

export type WorkoutSet = {
  weight: string;
  reps: string;
};

export type WorkoutExercise = {
  id?: string;
  workout_id?: string;
  name: string;
  sets: WorkoutSet[];
};

export type Workout = {
  id?: string;
  date: string | Date;
  bodyParts: string[];
  exercises: WorkoutExercise[];
  duration?: number;
  time?: string;
  user_id?: string;
  created_at?: string;
}; 