"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { supabase } from "@/lib/supabase"
// import { toast } from "@/components/ui/use-toast"

// Simplified toast function until we properly set up the toast component
const toast = (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
  console.log(`Toast: ${options.title} - ${options.description}`)
  alert(`${options.title}: ${options.description}`)
}

interface ExerciseSet {
  weight: string;
  reps: string;
}

interface WorkoutExercise {
  name: string;
  sets: ExerciseSet[];
}

interface ExerciseMapItem {
  id: number;
  name: string;
}

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

export default function AddWorkout() {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState("")
  const [time, setTime] = useState("")
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([])
  const [availableExercises, setAvailableExercises] = useState<any[]>([])
  const [exercises, setExercises] = useState<WorkoutExercise[]>([{ name: "", sets: [{ weight: "", reps: "" }] }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Get the current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
    }
    fetchUser()
  }, [router])

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

  const formatTimeForDB = (timeString: string) => {
    if (!timeString) return null
    
    // Parse time in 12-hour format
    const match = timeString.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i)
    if (!match) return null
    
    let [_, hours, minutes, period] = match
    let hour = parseInt(hours)
    
    // Convert to 24-hour format
    if (period.toLowerCase() === 'pm' && hour < 12) {
      hour += 12
    } else if (period.toLowerCase() === 'am' && hour === 12) {
      hour = 0
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save workouts.",
        variant: "destructive",
      })
      return
    }
    
    if (exercises.some(ex => !ex.name)) {
      toast({
        title: "Error",
        description: "Please provide a name for all exercises.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. Insert the workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          start_time: formatTimeForDB(time),
          duration: duration ? parseInt(duration) : null,
          name: selectedBodyParts.length > 0 
            ? `${selectedBodyParts.join(' & ')} Workout` 
            : `Workout ${new Date().toLocaleDateString()}`
        })
        .select()
        
      if (workoutError) throw workoutError
      
      const workoutId = workout[0].id
      
      // 2. Get exercise IDs from the database based on names
      const exerciseNames = exercises.map(ex => ex.name)
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('id, name')
        .in('name', exerciseNames)
        
      if (exerciseError) throw exerciseError
      
      // Create a mapping from exercise name to ID
      const exerciseMap: Record<string, number> = {}
      if (exerciseData) {
        exerciseData.forEach((exercise: ExerciseMapItem) => {
          exerciseMap[exercise.name] = exercise.id
        })
      }
      
      // 3. Insert workout exercises with sets
      const workoutExercises = []
      
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i]
        const exerciseId = exerciseMap[exercise.name]
        
        if (!exerciseId) {
          console.error(`Could not find ID for exercise: ${exercise.name}`)
          continue
        }
        
        // Insert the workout exercise
        const { data: workoutExercise, error: workoutExerciseError } = await supabase
          .from('workout_exercises')
          .insert({
            workout_id: workoutId,
            exercise_id: exerciseId,
            order_index: i,
            sets: exercise.sets.length,
            reps: exercise.sets.reduce((acc, set) => acc + parseInt(set.reps || '0'), 0),
            weight: exercise.sets.reduce((max, set) => Math.max(max, parseFloat(set.weight || '0')), 0)
          })
          .select()
          
        if (workoutExerciseError) {
          console.error('Error inserting workout exercise:', workoutExerciseError)
          continue
        }
        
        workoutExercises.push(workoutExercise[0])
      }
      
      toast({
        title: "Success!",
        description: "Your workout has been saved.",
      })
      
      router.push("/")
    } catch (error) {
      console.error('Error saving workout:', error)
      toast({
        title: "Error",
        description: "There was an error saving your workout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6 flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Add New Workout</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                  <CardDescription>Record the date, time, duration and targeted body parts</CardDescription>
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
                      <CardDescription>Add the exercises you performed</CardDescription>
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
                            {exercise.sets.length > 1 && (
                              <div className="col-span-1 flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Workout"}
              </Button>
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

