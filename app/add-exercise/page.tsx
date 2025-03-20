"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Plus, X } from "lucide-react"

const bodyPartOptions = [
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

export default function AddExercisePage() {
  const router = useRouter()
  const [exerciseName, setExerciseName] = useState("")
  const [primaryMuscle, setPrimaryMuscle] = useState("")
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([])
  const [newSecondaryMuscle, setNewSecondaryMuscle] = useState("")
  const [instructions, setInstructions] = useState("")

  const handleAddSecondaryMuscle = () => {
    if (newSecondaryMuscle && !secondaryMuscles.includes(newSecondaryMuscle)) {
      setSecondaryMuscles([...secondaryMuscles, newSecondaryMuscle])
      setNewSecondaryMuscle("")
    }
  }

  const handleRemoveSecondaryMuscle = (muscle: string) => {
    setSecondaryMuscles(secondaryMuscles.filter((m) => m !== muscle))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would normally save the exercise data
    // For now, we'll just log it and navigate back
    console.log({
      name: exerciseName,
      primaryMuscle,
      secondaryMuscles,
      instructions,
    })

    // In a real app, you'd save this to your database or localStorage

    router.push("/exercises")
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/exercises">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Exercise</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
            <CardDescription>Add a new exercise to your personal library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input
                id="exercise-name"
                placeholder="e.g., Barbell Bench Press"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-muscle">Primary Muscle Group</Label>
              <Select value={primaryMuscle} onValueChange={setPrimaryMuscle} required>
                <SelectTrigger id="primary-muscle">
                  <SelectValue placeholder="Select primary muscle" />
                </SelectTrigger>
                <SelectContent>
                  {bodyPartOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Secondary Muscle Groups</Label>
              <div className="flex gap-2">
                <Select value={newSecondaryMuscle} onValueChange={setNewSecondaryMuscle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select muscle" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyPartOptions
                      .filter((option) => option !== primaryMuscle && !secondaryMuscles.includes(option))
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSecondaryMuscle}
                  disabled={!newSecondaryMuscle}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {secondaryMuscles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {secondaryMuscles.map((muscle) => (
                    <div key={muscle} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                      {muscle}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => handleRemoveSecondaryMuscle(muscle)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Describe how to perform this exercise correctly..."
                rows={5}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/exercises">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Save Exercise</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

