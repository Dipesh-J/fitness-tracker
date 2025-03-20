"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDays, Dumbbell, LineChart, Plus, Clock } from "lucide-react"
import { Header } from "@/components/header"
import { ProgressChart } from "@/components/progress-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface Workout {
  id: string;
  date: string;
  start_time?: string;
  duration?: number;
  name?: string;
  workout_exercises?: WorkoutExercise[];
}

interface WorkoutExercise {
  id: string;
  exercise_id: number;
  exercises?: {
    name?: string;
    body_parts?: {
      name?: string;
    } | {
      name?: string;
    }[];
  };
}

interface Stats {
  totalWorkouts: number;
  streak: number;
  progress: number;
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileName, setProfileName] = useState("")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    streak: 0,
    progress: 0
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch user profile if exists
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single()
          
        if (profileData) {
          setProfileName(profileData.name || "")
        }

        // Fetch user workouts
        const { data: workoutsData, error } = await supabase
          .from("workouts")
          .select(`
            id, 
            date, 
            start_time, 
            duration, 
            name,
            workout_exercises(
              id,
              exercise_id,
              exercises(name, body_parts(name))
            )
          `)
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(5)
        
        if (workoutsData) {
          setWorkouts(workoutsData as Workout[])
        }

        // Calculate stats
        const { count: totalWorkouts } = await supabase
          .from("workouts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        setStats({
          totalWorkouts: totalWorkouts || 0,
          streak: calculateStreak(workoutsData as Workout[] || []),
          progress: 15 // This would need real calculation based on your app's logic
        })
      }
      
      setLoading(false)
    }

    getUser()
  }, [])

  // Calculate workout streak
  const calculateStreak = (workouts: Workout[]) => {
    if (!workouts || workouts.length === 0) return 0
    
    const sortedDates = [...workouts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(w => new Date(w.date).toISOString().split('T')[0])
    
    // Remove duplicates (same day workouts)
    const uniqueDates = [...new Set(sortedDates)]
    
    let streak = 1
    let currentDate = new Date(uniqueDates[0])
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)
      
      if (new Date(uniqueDates[i]).toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) {
        streak++
        currentDate = prevDate
      } else {
        break
      }
    }
    
    return streak
  }

  // Format time from database (24h) to 12h AM/PM
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  }

  // Get body parts from a workout
  const getWorkoutBodyParts = (workout: Workout) => {
    if (!workout?.workout_exercises) return [];
    
    const bodyParts = new Set<string>();
    
    workout.workout_exercises.forEach(exercise => {
      if (exercise.exercises?.body_parts) {
        // Handle both cases - single object or array
        if (Array.isArray(exercise.exercises.body_parts)) {
          exercise.exercises.body_parts.forEach(part => {
            if (part.name) {
              bodyParts.add(part.name);
            }
          });
        } else if (exercise.exercises.body_parts.name) {
          // Handle case where body_parts is a single object
          bodyParts.add(exercise.exercises.body_parts.name);
        }
      }
    });
    
    return Array.from(bodyParts);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              {!loading && user && (
                <p className="text-muted-foreground">
                  Welcome back{profileName ? `, ${profileName}` : ""}!
                </p>
              )}
            </div>
            <Link href="/add-workout">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Workout
              </Button>
            </Link>
          </div>
          
          {!loading && !user ? (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Welcome to FitTrack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  FitTrack helps you log and track your fitness progress. Sign in to start tracking your workouts!
                </p>
                <div className="flex gap-4">
                  <Link href="/auth/login">
                    <Button>Login</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="outline">Sign Up</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Total Workouts</h3>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{stats.totalWorkouts}</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Workout Streak</h3>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{stats.streak} days</p>
                  <p className="text-sm text-muted-foreground">Keep it up!</p>
                </div>
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Progress</h3>
                  </div>
                  <p className="mt-3 text-3xl font-bold">+{stats.progress}%</p>
                  <p className="text-sm text-muted-foreground">Bench press max</p>
                </div>
              </div>
              
              <div className="mt-8 grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-xl font-bold">Recent Workouts</h2>
                  <div className="rounded-lg border shadow-sm">
                    <div className="overflow-x-auto">
                      {workouts.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground">No workouts yet. Add your first workout!</p>
                          <div className="mt-4">
                            <Link href="/add-workout">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Workout
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50 text-sm">
                              <th className="px-4 py-3 text-left font-medium">Date</th>
                              <th className="px-4 py-3 text-left font-medium">Time</th>
                              <th className="px-4 py-3 text-left font-medium">Body Parts</th>
                              <th className="px-4 py-3 text-left font-medium">Exercises</th>
                              <th className="px-4 py-3 text-left font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workouts.map((workout) => (
                              <tr key={workout.id} className="border-b">
                                <td className="px-4 py-3">
                                  {workout.date ? format(new Date(workout.date), 'MMM dd, yyyy') : 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{formatTime(workout.start_time)}</span>
                                    {workout.duration && (
                                      <span className="ml-1.5 text-xs text-muted-foreground">
                                        ({workout.duration} min)
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {getWorkoutBodyParts(workout).join(", ") || "N/A"}
                                </td>
                                <td className="px-4 py-3">
                                  {workout.workout_exercises?.length || 0} exercises
                                </td>
                                <td className="px-4 py-3">
                                  <Link href={`/workout/${workout.id}`}>
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="mb-4 text-xl font-bold">Progress</h2>
                  <ProgressChart />
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <footer className="border-t py-4">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FitTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

