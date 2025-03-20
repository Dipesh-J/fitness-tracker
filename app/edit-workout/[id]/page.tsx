"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Plus, Trash2, Clock } from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { getExercisesBySelectedBodyParts } from "@/lib/exercise-data"
import { ExerciseCombobox } from "@/components/exercise-combobox"
import { Header } from "@/components/header"
import { TimeInput } from "@/components/time-input"

const bodyParts = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Abs",
  "Calves",
  "Forearms",
  "Traps",
  "Full Body",
]

// Mock workout data
const mockWorkouts = {
  "1": {
    id: "1",
    date: "2025-03-19",
    time: "08:30 AM",
    duration: "60",
    bodyParts: ["Chest", "Triceps"],
    exercises: [
      {
        name: "Bench Press",
        sets: [
          { weight: "135", reps: "12" },
          { weight: "155", reps: "10" },
          { weight: "175", reps: "8" },
          { weight: "185", reps: "6" },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        sets: [
          { weight: "50", reps: "12" },
          { weight: "55", reps: "10" },
          { weight: "60", reps: "8" },
        ],
      },
      {
        name: "Cable Flyes",
        sets: [
          { weight: "30", reps: "15" },
          { weight: "35", reps: "12" },
          { weight: "40", reps: "10" },
        ],
      },
      {
        name: "Tricep Pushdowns",
        sets: [
          { weight: "50", reps: "15" },
          { weight: "60", reps: "12" },
          { weight: "70", reps: "10" },
        ],
      },
      {
        name: "Overhead Tricep Extension",
        sets: [
          { weight: "60", reps: "12" },
          { weight: "70", reps: "10" },
          { weight: "80", reps: "8" },
        ],
      },
    ],
  },
  "2": {
    id: "2",
    date: "2025-03-17",
    time: "07:00 AM",
    duration: "75",
    bodyParts: ["Back", "Biceps"],
    exercises: [
      {
        name: "Pull-ups",
        sets: [
          { weight: "BW", reps: "10" },
          { weight: "BW", reps: "8" },
          { weight: "BW", reps: "8" },
        ],
      },
      {
        name: "Barbell Rows",
        sets: [
          { weight: "135", reps: "12" },
          { weight: "155", reps: "10" },
          { weight: "175", reps: "8" },
        ],
      },
      // ...other exercises
    ],
  },
  "3": {
    id: "3",
    date: "2025-03-15",
    time: "09:00 AM",
    duration: "45",
    bodyParts: ["Legs"],
    exercises: [
      {
        name: "Squats",
        sets: [
          { weight: "185", reps: "12" },
          { weight: "225", reps: "10" },
          { weight: "245", reps: "8" },
          { weight: "265", reps: "6" },
        ],
      },
      // ...other exercises
    ],
  },
};

export default function EditWorkout() {
  const params = useParams();
  const router = useRouter();
  
  const [date, setDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState("");
  const [time, setTime] = useState("");
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [exercises, setExercises] = useState([{ name: "", sets: [{ weight: "", reps: "" }] }]);

  // Load workout data
  useEffect(() => {
    const id = params.id as string;
    const workout = mockWorkouts[id as keyof typeof mockWorkouts];
    
    if (workout) {
      const workoutDate = new Date(workout.date);
      setDate(workoutDate);
      setDuration(workout.duration || "");
      setTime(workout.time || "");
      setSelectedBodyParts(workout.bodyParts);
      setExercises(workout.exercises);
    }
  }, [params.id]);

  // Update available exercises when body parts change
  useEffect(() => {
    const exercises = getExercisesBySelectedBodyParts(selectedBodyParts);
    setAvailableExercises(exercises);
  }, [selectedBodyParts]);

  const handleBodyPartToggle = (bodyPart: string) => {
    setSelectedBodyParts((current) =>
      current.includes(bodyPart) ? current.filter((part) => part !== bodyPart) : [...current, bodyPart],
    )
  }

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: [{ weight: "", reps: "" }] }])
  }

  const removeExercise = (index: number) => {
    const newExercises = [...exercises]
    newExercises.splice(index, 1)
    setExercises(newExercises)
  }

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.push({ weight: "", reps: "" })
    setExercises(newExercises)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(newExercises)
  }

  const updateExerciseName = (index: number, name: string) => {
    const newExercises = [...exercises]
    newExercises[index].name = name
    setExercises(newExercises)
  }

  const updateSetValue = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: string) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(newExercises)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would normally update the workout data
    console.log({
      id: params.id,
      date,
      time,
      duration,
      bodyParts: selectedBodyParts,
      exercises,
    })

    // In a real app, you'd save this to your database
    router.push(`/workout/${params.id}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6 flex items-center gap-2">
            <Link href={`/workout/${params.id}`}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Workout</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                  <CardDescription>Update the workout details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <DatePicker date={date} setDate={setDate} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <TimeInput 
                        value={time} 
                        onChange={setTime} 
                        id="time"
                        placeholder="e.g., 07:30 AM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="duration"
                          type="number"
                          placeholder="e.g., 60"
                          min="1"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Body Parts</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {bodyParts.map((part) => (
                        <div key={part} className="flex items-center space-x-2">
                          <Checkbox
                            id={`bodyPart-${part}`}
                            checked={selectedBodyParts.includes(part)}
                            onCheckedChange={() => handleBodyPartToggle(part)}
                          />
                          <label
                            htmlFor={`bodyPart-${part}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {part}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Exercises</CardTitle>
                      <CardDescription>Update the exercises</CardDescription>
                    </div>
                    <Button type="button" onClick={addExercise} size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Exercise
                    </Button>
                  </CardHeader>
                </Card>

                {exercises.map((exercise, exerciseIndex) => (
                  <Card key={exerciseIndex}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`exercise-${exerciseIndex}`}>Exercise {exerciseIndex + 1}</Label>
                        {exercises.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(exerciseIndex)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {selectedBodyParts.length > 0 ? (
                        <ExerciseCombobox
                          exercises={availableExercises}
                          value={exercise.name}
                          onChange={(value) => updateExerciseName(exerciseIndex, value)}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground mb-2">
                          Please select body parts first to see available exercises
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Label>Sets</Label>
                          <Button type="button" variant="outline" size="sm" onClick={() => addSet(exerciseIndex)}>
                            <Plus className="mr-1 h-3 w-3" />
                            Add Set
                          </Button>
                        </div>

                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="mb-2 grid grid-cols-12 gap-2">
                            <div className="col-span-1 flex items-center justify-center">
                              <span className="text-sm font-medium text-muted-foreground">{setIndex + 1}</span>
                            </div>
                            <div className="col-span-5">
                              <Input
                                type="text"
                                placeholder="Weight (kg/lbs)"
                                value={set.weight}
                                onChange={(e) => updateSetValue(exerciseIndex, setIndex, "weight", e.target.value)}
                              />
                            </div>
                            <div className="col-span-5">
                              <Input
                                type="text"
                                placeholder="Reps"
                                value={set.reps}
                                onChange={(e) => updateSetValue(exerciseIndex, setIndex, "reps", e.target.value)}
                              />
                            </div>
                            <div className="col-span-1">
                              {exercise.sets.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Link href={`/workout/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FitTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 