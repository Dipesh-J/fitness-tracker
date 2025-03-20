"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Edit, Trash2, Clock, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Exercise {
  id: string;
  name: string;
  sets: {
    weight: number;
    reps: number;
  }[];
}

interface Workout {
  id: string;
  date: string;
  start_time?: string;
  duration?: number;
  name?: string;
  exercises: Exercise[];
  bodyParts: string[];
}

export default function WorkoutDetail() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchWorkout() {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id,
          date,
          start_time,
          duration,
          name,
          workout_exercises(
            id,
            exercise_id,
            sets,
            reps,
            weight,
            exercises(
              id,
              name,
              body_parts(name)
            )
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Error fetching workout:', error)
        setLoading(false)
        return
      }

      // Process the workout data
      const bodyParts = new Set<string>()
      const exercises: Exercise[] = []

      data.workout_exercises?.forEach((we: any) => {
        // Add body part
        if (we.exercises?.body_parts) {
          if (Array.isArray(we.exercises.body_parts)) {
            we.exercises.body_parts.forEach((bp: any) => {
              if (bp.name) bodyParts.add(bp.name)
            })
          } else if (we.exercises.body_parts.name) {
            bodyParts.add(we.exercises.body_parts.name)
          }
        }

        // Add exercise
        exercises.push({
          id: we.exercises.id,
          name: we.exercises.name,
          sets: [{
            weight: we.weight,
            reps: we.reps
          }]
        })
      })

      setWorkout({
        id: data.id,
        date: data.date,
        start_time: data.start_time,
        duration: data.duration,
        name: data.name,
        exercises,
        bodyParts: Array.from(bodyParts)
      })
      
      setLoading(false)
    }

    fetchWorkout()
  }, [params.id])

  const handleDelete = async () => {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workout?.id)

    if (error) {
      console.error('Error deleting workout:', error)
      return
    }

    setDeleteDialogOpen(false)
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading workout details...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-xl font-semibold mb-2">Workout not found</h2>
              <p className="text-muted-foreground mb-4">The workout you're looking for doesn't exist or has been deleted.</p>
              <Link href="/">
                <Button>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{workout.name || "Workout"}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(workout.date), 'MMM dd, yyyy')}</span>
                  {workout.start_time && (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>{workout.start_time}</span>
                    </>
                  )}
                  {workout.duration && (
                    <span>({workout.duration} min)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/edit-workout/${workout.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Body Parts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {workout.bodyParts.map((part) => (
                    <span
                      key={part}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {workout.exercises.map((exercise) => (
                    <div key={exercise.id} className="space-y-2">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <div className="grid gap-2">
                        {exercise.sets.map((set, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-2"
                          >
                            <span className="text-sm text-muted-foreground">Set {index + 1}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">
                                {set.weight} {set.weight === 0 ? "BW" : "lbs"}
                              </span>
                              <span className="text-sm text-muted-foreground">{set.reps} reps</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="border-t py-4">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FitTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

