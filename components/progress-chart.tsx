"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from "@/lib/supabase"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns"

interface ChartData {
  name: string;
  [key: string]: any;
}

// Chart colors
const bodyPartColors = {
  Chest: "#ff6b6b",
  Back: "#48dbfb",
  Legs: "#1dd1a1",
  Shoulders: "#feca57",
  Arms: "#5f27cd",
  Abs: "#00d2d3",
  "Full Body": "#6c5ce7",
  Cardio: "#ff9ff3",
};

export function ProgressChart() {
  const [selectedTab, setSelectedTab] = useState('weight');
  const [selectedView, setSelectedView] = useState('bar');
  const [weightData, setWeightData] = useState<ChartData[]>([]);
  const [volumeData, setVolumeData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchWorkoutData() {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Get last 4 weeks
      const now = new Date();
      const weeks = [];
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i));
        const weekEnd = endOfWeek(subWeeks(now, i));
        weeks.push({
          name: `Week ${4-i}`,
          start: weekStart,
          end: weekEnd
        });
      }
      
      // Get all workout exercises with weights
      const { data: workoutExercises, error } = await supabase
        .from('workout_exercises')
        .select(`
          workout_id,
          exercise_id,
          weight,
          sets,
          reps,
          workouts(date),
          exercises(name, body_parts(name))
        `)
        .eq('workouts.user_id', user.id);
      
      if (error || !workoutExercises) {
        console.error('Error fetching workout data:', error);
        setLoading(false);
        return;
      }
      
      // Collect all body parts
      const uniqueBodyParts = new Set<string>();
      
      workoutExercises.forEach((exercise: any) => {
        if (exercise.exercises?.body_parts) {
          let bodyPartName: string | undefined;
          
          if (Array.isArray(exercise.exercises.body_parts)) {
            bodyPartName = exercise.exercises.body_parts[0]?.name;
          } else {
            bodyPartName = exercise.exercises.body_parts.name;
          }
          
          if (bodyPartName) {
            uniqueBodyParts.add(bodyPartName);
          }
        }
      });
      
      const bodyPartList = Array.from(uniqueBodyParts);
      setBodyParts(bodyPartList);
      
      // Process data for charts
      const weightProgressData: ChartData[] = weeks.map(week => {
        const weekData: ChartData = { name: week.name };
        
        bodyPartList.forEach(bodyPart => {
          // Find max weight for each body part in this week
          const maxWeight = workoutExercises
            .filter((ex: any) => {
              // Check if exercise is for this body part
              let exBodyPart: string | undefined;
              if (Array.isArray(ex.exercises?.body_parts)) {
                exBodyPart = ex.exercises.body_parts[0]?.name;
              } else {
                exBodyPart = ex.exercises?.body_parts?.name;
              }
              
              // Check if the workout is within this week
              const workoutDate = new Date(ex.workouts?.date);
              return exBodyPart === bodyPart && 
                workoutDate >= week.start && 
                workoutDate <= week.end;
            })
            .reduce((max: number, ex: any) => {
              return Math.max(max, ex.weight || 0);
            }, 0);
          
          weekData[bodyPart] = maxWeight;
        });
        
        return weekData;
      });
      
      const volumeProgressData: ChartData[] = weeks.map(week => {
        const weekData: ChartData = { name: week.name };
        
        bodyPartList.forEach(bodyPart => {
          // Calculate total volume (weight * sets * reps) for each body part in this week
          const totalVolume = workoutExercises
            .filter((ex: any) => {
              // Check if exercise is for this body part
              let exBodyPart: string | undefined;
              if (Array.isArray(ex.exercises?.body_parts)) {
                exBodyPart = ex.exercises.body_parts[0]?.name;
              } else {
                exBodyPart = ex.exercises?.body_parts?.name;
              }
              
              // Check if the workout is within this week
              const workoutDate = new Date(ex.workouts?.date);
              return exBodyPart === bodyPart && 
                workoutDate >= week.start && 
                workoutDate <= week.end;
            })
            .reduce((sum: number, ex: any) => {
              const volume = (ex.weight || 0) * (ex.sets || 0) * (ex.reps || 0);
              return sum + volume;
            }, 0);
          
          weekData[bodyPart] = totalVolume;
        });
        
        return weekData;
      });
      
      setWeightData(weightProgressData);
      setVolumeData(volumeProgressData);
      setLoading(false);
    }
    
    fetchWorkoutData();
  }, []);
  
  const data = selectedTab === 'weight' ? weightData : volumeData;
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
          <CardDescription>Loading your progress data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data.length || bodyParts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
          <CardDescription>Track your progress over time by body part</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No workout data available yet.</p>
            <p className="text-sm mt-2">Add workouts to see your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
        <CardDescription>Track your progress over time by body part</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="weight">Max Weight</TabsTrigger>
              <TabsTrigger value="volume">Total Volume</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <button 
                className={`p-1.5 rounded-md ${selectedView === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => setSelectedView('bar')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="8" x2="9" y2="16" />
                  <line x1="15" y1="12" x2="15" y2="16" />
                </svg>
              </button>
              <button 
                className={`p-1.5 rounded-md ${selectedView === 'line' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => setSelectedView('line')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m3 15 5-5 4 4 8-8" />
                </svg>
              </button>
            </div>
          </div>
          
          <TabsContent value="weight" className="mt-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {selectedView === 'bar' ? (
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {bodyParts.map((part) => (
                      <Bar 
                        key={part} 
                        dataKey={part} 
                        fill={bodyPartColors[part as keyof typeof bodyPartColors] || "#999"} 
                      />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {bodyParts.map((part) => (
                      <Line 
                        key={part} 
                        type="monotone" 
                        dataKey={part} 
                        stroke={bodyPartColors[part as keyof typeof bodyPartColors] || "#999"} 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="volume" className="mt-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {selectedView === 'bar' ? (
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {bodyParts.map((part) => (
                      <Bar 
                        key={part} 
                        dataKey={part} 
                        fill={bodyPartColors[part as keyof typeof bodyPartColors] || "#999"} 
                      />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {bodyParts.map((part) => (
                      <Line 
                        key={part} 
                        type="monotone" 
                        dataKey={part} 
                        stroke={bodyPartColors[part as keyof typeof bodyPartColors] || "#999"}
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Progress data is calculated from your recorded workouts</p>
      </CardFooter>
    </Card>
  )
} 