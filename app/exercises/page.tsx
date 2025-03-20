"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { Header } from "@/components/header"

// Mock exercise data
const exercisesByBodyPart = {
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
  Arms: [
    { name: "Bicep Curls", primaryMuscle: "Biceps", secondaryMuscles: ["Forearms"] },
    { name: "Hammer Curls", primaryMuscle: "Biceps", secondaryMuscles: ["Forearms"] },
    { name: "Preacher Curls", primaryMuscle: "Biceps", secondaryMuscles: [] },
    { name: "Tricep Pushdowns", primaryMuscle: "Triceps", secondaryMuscles: [] },
    { name: "Skull Crushers", primaryMuscle: "Triceps", secondaryMuscles: [] },
    { name: "Overhead Tricep Extensions", primaryMuscle: "Triceps", secondaryMuscles: [] },
    { name: "Dips", primaryMuscle: "Triceps", secondaryMuscles: ["Chest", "Shoulders"] },
  ],
  Core: [
    { name: "Crunches", primaryMuscle: "Abs", secondaryMuscles: [] },
    { name: "Leg Raises", primaryMuscle: "Lower Abs", secondaryMuscles: ["Hip Flexors"] },
    { name: "Planks", primaryMuscle: "Core", secondaryMuscles: ["Shoulders"] },
    { name: "Russian Twists", primaryMuscle: "Obliques", secondaryMuscles: ["Abs"] },
    { name: "Hanging Leg Raises", primaryMuscle: "Lower Abs", secondaryMuscles: ["Hip Flexors"] },
    { name: "Ab Wheel Rollouts", primaryMuscle: "Abs", secondaryMuscles: ["Shoulders", "Lower Back"] },
  ],
}

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("Chest")

  const filteredExercises = searchQuery
    ? Object.values(exercisesByBodyPart)
        .flat()
        .filter(
          (exercise) =>
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exercise.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exercise.secondaryMuscles.some((muscle) => muscle.toLowerCase().includes(searchQuery.toLowerCase())),
        )
    : exercisesByBodyPart[activeTab as keyof typeof exercisesByBodyPart] || []

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Exercise Library</h1>
            <div className="flex gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search exercises..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href="/add-exercise">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exercise
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="Chest" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-2">
              {Object.keys(exercisesByBodyPart).map((bodyPart) => (
                <TabsTrigger
                  key={bodyPart}
                  value={bodyPart}
                  className="rounded-md px-3 py-1.5 text-sm"
                  onClick={() => setSearchQuery("")}
                >
                  {bodyPart}
                </TabsTrigger>
              ))}
            </TabsList>

            {searchQuery ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Primary Muscle:</span>
                          <span className="ml-2 text-sm text-muted-foreground">{exercise.primaryMuscle}</span>
                        </div>
                        {exercise.secondaryMuscles.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Secondary Muscles:</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {exercise.secondaryMuscles.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              Object.keys(exercisesByBodyPart).map((bodyPart) => (
                <TabsContent key={bodyPart} value={bodyPart} className="mt-0">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {exercisesByBodyPart[bodyPart as keyof typeof exercisesByBodyPart].map((exercise, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Primary Muscle:</span>
                              <span className="ml-2 text-sm text-muted-foreground">{exercise.primaryMuscle}</span>
                            </div>
                            {exercise.secondaryMuscles.length > 0 && (
                              <div>
                                <span className="text-sm font-medium">Secondary Muscles:</span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {exercise.secondaryMuscles.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))
            )}
          </Tabs>
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

