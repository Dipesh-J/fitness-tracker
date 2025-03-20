"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface WorkoutEvent {
  id: string;
  date: string;
  bodyParts: string[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workoutEvents, setWorkoutEvents] = useState<WorkoutEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkouts() {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }
      
      // Get first and last day of current month for query
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const firstDayStr = format(firstDay, 'yyyy-MM-dd')
      const lastDayStr = format(lastDay, 'yyyy-MM-dd')
      
      // Fetch workouts for the current month
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id, 
          date,
          workout_exercises(
            exercises(
              body_parts(name)
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('date', firstDayStr)
        .lte('date', lastDayStr)
        .order('date', { ascending: true })
      
      if (error) {
        console.error('Error fetching workouts:', error)
        setLoading(false)
        return
      }
      
      // Process workouts to match the expected format
      const processedWorkouts: WorkoutEvent[] = data.map((workout: any) => {
        const bodyParts = new Set<string>()
        
        // Extract body parts from exercises
        workout.workout_exercises?.forEach((we: any) => {
          if (we.exercises?.body_parts) {
            // Handle both array and single object cases
            if (Array.isArray(we.exercises.body_parts)) {
              we.exercises.body_parts.forEach((bp: any) => {
                if (bp.name) bodyParts.add(bp.name)
              })
            } else if (we.exercises.body_parts.name) {
              bodyParts.add(we.exercises.body_parts.name)
            }
          }
        })
        
        return {
          id: workout.id,
          date: workout.date,
          bodyParts: Array.from(bodyParts)
        }
      })
      
      setWorkoutEvents(processedWorkouts)
      setLoading(false)
    }
    
    fetchWorkouts()
  }, [currentDate])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const hasWorkout = (year: number, month: number, day: number) => {
    const dateString = formatDateString(year, month, day)
    return workoutEvents.some((event) => event.date === dateString)
  }

  const getWorkoutInfo = (year: number, month: number, day: number) => {
    const dateString = formatDateString(year, month, day)
    return workoutEvents.find((event) => event.date === dateString)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Create calendar grid
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Workout Calendar</h1>
            <Link href="/add-workout">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Workout
              </Button>
            </Link>
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b p-4">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[month]} {year}
              </h2>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 border-b">
              {dayNames.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-muted">
                {calendarDays.map((day, index) => (
                  <div key={index} className={cn("min-h-[100px] bg-background p-2", day === null && "bg-muted")}>
                    {day !== null && (
                      <>
                        <div className="flex justify-between">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                              hasWorkout(year, month, day) && "bg-primary text-primary-foreground",
                            )}
                          >
                            {day}
                          </span>
                        </div>

                        {hasWorkout(year, month, day) && (
                          <Link href={`/workout/${getWorkoutInfo(year, month, day)?.id}`}>
                            <div className="mt-1 rounded bg-primary/10 p-1 text-xs cursor-pointer">
                              <div className="font-medium">Workout</div>
                              <div className="text-muted-foreground">
                                {getWorkoutInfo(year, month, day)?.bodyParts.join(", ") || "General workout"}
                              </div>
                            </div>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
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

