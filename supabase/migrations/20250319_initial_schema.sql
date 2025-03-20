-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create body_parts table
CREATE TABLE IF NOT EXISTS body_parts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  body_part_id INTEGER REFERENCES body_parts(id) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for exercises (public read only)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exercises are viewable by everyone" ON exercises
  FOR SELECT USING (true);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT,
  date DATE NOT NULL,
  start_time TIME,
  duration INTEGER, -- duration in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Create workout_exercises table (join table between workouts and exercises)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id INTEGER REFERENCES exercises(id) NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight NUMERIC(6, 2), -- weight in kg with 2 decimal places
  notes TEXT,
  order_index INTEGER NOT NULL, -- to keep exercises in order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for workout_exercises
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Seed data for body parts
INSERT INTO body_parts (name) VALUES
  ('Chest'),
  ('Back'),
  ('Shoulders'),
  ('Biceps'),
  ('Triceps'),
  ('Legs'),
  ('Abs'),
  ('Cardio'),
  ('Full Body')
ON CONFLICT (name) DO NOTHING;

-- Seed data for exercises
INSERT INTO exercises (name, body_part_id, description) VALUES
  ('Bench Press', 1, 'Lie on a flat bench and press the barbell upward'),
  ('Push-ups', 1, 'Body weight exercise for the chest'),
  ('Incline Bench Press', 1, 'Bench press on an inclined bench'),
  ('Deadlift', 2, 'Compound exercise that works the back, legs and core'),
  ('Pull-ups', 2, 'Body weight exercise for the back'),
  ('Bent Over Rows', 2, 'Barbell row for the back muscles'),
  ('Shoulder Press', 3, 'Press the barbell or dumbbells overhead'),
  ('Lateral Raises', 3, 'Raise dumbbells to the sides for shoulder development'),
  ('Front Raises', 3, 'Raise dumbbells to the front for anterior deltoids'),
  ('Bicep Curls', 4, 'Curl the barbell or dumbbells for bicep development'),
  ('Hammer Curls', 4, 'Dumbbell curls with a neutral grip'),
  ('Preacher Curls', 4, 'Curls performed on a preacher bench'),
  ('Tricep Pushdowns', 5, 'Cable exercise for tricep development'),
  ('Skull Crushers', 5, 'Lying tricep extension with barbell or EZ bar'),
  ('Overhead Tricep Extension', 5, 'Extension of the triceps overhead'),
  ('Squats', 6, 'Compound exercise for leg development'),
  ('Leg Press', 6, 'Machine exercise for leg development'),
  ('Lunges', 6, 'Unilateral exercise for leg development'),
  ('Leg Extensions', 6, 'Isolation exercise for quadriceps'),
  ('Hamstring Curls', 6, 'Isolation exercise for hamstrings'),
  ('Calf Raises', 6, 'Exercise for calf development'),
  ('Crunches', 7, 'Basic abdominal exercise'),
  ('Leg Raises', 7, 'Lower abdominal exercise'),
  ('Planks', 7, 'Isometric core exercise'),
  ('Running', 8, 'Cardiovascular exercise'),
  ('Cycling', 8, 'Cardiovascular exercise'),
  ('Jumping Rope', 8, 'Cardiovascular exercise'),
  ('Burpees', 9, 'Full body exercise combining squat, push-up and jump')
ON CONFLICT (id) DO NOTHING; 