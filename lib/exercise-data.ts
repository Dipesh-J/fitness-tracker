// Exercise data organized by body part
export const exercisesByBodyPart = {
  Chest: [
    { name: "Bench Press", primaryMuscle: "Chest", secondaryMuscles: ["Triceps", "Shoulders"] },
    { name: "Incline Bench Press", primaryMuscle: "Upper Chest", secondaryMuscles: ["Shoulders", "Triceps"] },
    { name: "Decline Bench Press", primaryMuscle: "Lower Chest", secondaryMuscles: ["Triceps"] },
    { name: "Dumbbell Flyes", primaryMuscle: "Chest", secondaryMuscles: ["Shoulders"] },
    { name: "Cable Crossovers", primaryMuscle: "Chest", secondaryMuscles: ["Shoulders"] },
    { name: "Push-ups", primaryMuscle: "Chest", secondaryMuscles: ["Triceps", "Shoulders", "Core"] },
  ],
  Back: [
    { name: "Pull-ups", primaryMuscle: "Lats", secondaryMuscles: ["Biceps", "Middle Back"] },
    { name: "Lat Pulldowns", primaryMuscle: "Lats", secondaryMuscles: ["Biceps", "Middle Back"] },
    { name: "Barbell Rows", primaryMuscle: "Middle Back", secondaryMuscles: ["Lats", "Biceps"] },
    { name: "T-Bar Rows", primaryMuscle: "Middle Back", secondaryMuscles: ["Lats", "Biceps"] },
    { name: "Seated Cable Rows", primaryMuscle: "Middle Back", secondaryMuscles: ["Lats", "Biceps"] },
    { name: "Deadlifts", primaryMuscle: "Lower Back", secondaryMuscles: ["Glutes", "Hamstrings", "Traps"] },
  ],
  Legs: [
    { name: "Squats", primaryMuscle: "Quadriceps", secondaryMuscles: ["Glutes", "Hamstrings", "Calves"] },
    { name: "Leg Press", primaryMuscle: "Quadriceps", secondaryMuscles: ["Glutes", "Hamstrings"] },
    { name: "Lunges", primaryMuscle: "Quadriceps", secondaryMuscles: ["Glutes", "Hamstrings"] },
    { name: "Leg Extensions", primaryMuscle: "Quadriceps", secondaryMuscles: [] },
    { name: "Romanian Deadlifts", primaryMuscle: "Hamstrings", secondaryMuscles: ["Glutes", "Lower Back"] },
    { name: "Leg Curls", primaryMuscle: "Hamstrings", secondaryMuscles: [] },
    { name: "Calf Raises", primaryMuscle: "Calves", secondaryMuscles: [] },
  ],
  Shoulders: [
    { name: "Overhead Press", primaryMuscle: "Shoulders", secondaryMuscles: ["Triceps"] },
    { name: "Lateral Raises", primaryMuscle: "Side Deltoids", secondaryMuscles: [] },
    { name: "Front Raises", primaryMuscle: "Front Deltoids", secondaryMuscles: [] },
    { name: "Reverse Flyes", primaryMuscle: "Rear Deltoids", secondaryMuscles: ["Traps"] },
    { name: "Shrugs", primaryMuscle: "Traps", secondaryMuscles: [] },
    { name: "Face Pulls", primaryMuscle: "Rear Deltoids", secondaryMuscles: ["Traps", "Rotator Cuff"] },
  ],
  Biceps: [
    { name: "Bicep Curls", primaryMuscle: "Biceps", secondaryMuscles: ["Forearms"] },
    { name: "Hammer Curls", primaryMuscle: "Biceps", secondaryMuscles: ["Forearms"] },
    { name: "Preacher Curls", primaryMuscle: "Biceps", secondaryMuscles: [] },
    { name: "Concentration Curls", primaryMuscle: "Biceps", secondaryMuscles: [] },
    { name: "Spider Curls", primaryMuscle: "Biceps", secondaryMuscles: [] },
  ],
  Triceps: [
    { name: "Tricep Pushdowns", primaryMuscle: "Triceps", secondaryMuscles: [] },
    { name: "Skull Crushers", primaryMuscle: "Triceps", secondaryMuscles: [] },
    { name: "Overhead Tricep Extensions", primaryMuscle: "Triceps", secondaryMuscles: [] },
    { name: "Dips", primaryMuscle: "Triceps", secondaryMuscles: ["Chest", "Shoulders"] },
    { name: "Close-Grip Bench Press", primaryMuscle: "Triceps", secondaryMuscles: ["Chest", "Shoulders"] },
  ],
  Abs: [
    { name: "Crunches", primaryMuscle: "Abs", secondaryMuscles: [] },
    { name: "Leg Raises", primaryMuscle: "Lower Abs", secondaryMuscles: ["Hip Flexors"] },
    { name: "Planks", primaryMuscle: "Core", secondaryMuscles: ["Shoulders"] },
    { name: "Russian Twists", primaryMuscle: "Obliques", secondaryMuscles: ["Abs"] },
    { name: "Hanging Leg Raises", primaryMuscle: "Lower Abs", secondaryMuscles: ["Hip Flexors"] },
    { name: "Ab Wheel Rollouts", primaryMuscle: "Abs", secondaryMuscles: ["Shoulders", "Lower Back"] },
  ],
  Calves: [
    { name: "Standing Calf Raises", primaryMuscle: "Calves", secondaryMuscles: [] },
    { name: "Seated Calf Raises", primaryMuscle: "Calves", secondaryMuscles: [] },
    { name: "Calf Press on Leg Press", primaryMuscle: "Calves", secondaryMuscles: [] },
  ],
  Forearms: [
    { name: "Wrist Curls", primaryMuscle: "Forearms", secondaryMuscles: [] },
    { name: "Reverse Wrist Curls", primaryMuscle: "Forearms", secondaryMuscles: [] },
    { name: "Farmers Walk", primaryMuscle: "Forearms", secondaryMuscles: ["Traps", "Core"] },
  ],
  Glutes: [
    { name: "Hip Thrusts", primaryMuscle: "Glutes", secondaryMuscles: ["Hamstrings"] },
    { name: "Glute Bridges", primaryMuscle: "Glutes", secondaryMuscles: ["Hamstrings"] },
    { name: "Bulgarian Split Squats", primaryMuscle: "Glutes", secondaryMuscles: ["Quadriceps", "Hamstrings"] },
  ],
  Traps: [
    { name: "Barbell Shrugs", primaryMuscle: "Traps", secondaryMuscles: [] },
    { name: "Upright Rows", primaryMuscle: "Traps", secondaryMuscles: ["Shoulders"] },
    { name: "Rack Pulls", primaryMuscle: "Traps", secondaryMuscles: ["Lower Back"] },
  ],
  "Full Body": [
    { name: "Burpees", primaryMuscle: "Full Body", secondaryMuscles: ["Chest", "Shoulders", "Quads", "Core"] },
    { name: "Thrusters", primaryMuscle: "Full Body", secondaryMuscles: ["Shoulders", "Quads", "Core"] },
    { name: "Clean and Press", primaryMuscle: "Full Body", secondaryMuscles: ["Shoulders", "Back", "Legs"] },
  ],
};

// Function to get exercises based on selected body parts
export const getExercisesBySelectedBodyParts = (selectedBodyParts: string[]) => {
  if (selectedBodyParts.length === 0) return [];
  
  let exercises: any[] = [];
  
  selectedBodyParts.forEach(bodyPart => {
    if (exercisesByBodyPart[bodyPart as keyof typeof exercisesByBodyPart]) {
      exercises = [
        ...exercises,
        ...exercisesByBodyPart[bodyPart as keyof typeof exercisesByBodyPart]
      ];
    }
  });
  
  // Remove duplicates
  const uniqueExercises = Array.from(new Set(exercises.map(ex => ex.name)))
    .map(name => exercises.find(ex => ex.name === name));
  
  return uniqueExercises;
}; 