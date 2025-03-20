"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ExerciseComboboxProps {
  exercises: { name: string; primaryMuscle: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ExerciseCombobox({ exercises, value, onChange, placeholder = "Select exercise..." }: ExerciseComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? exercises.find((exercise) => exercise.name === value)?.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search exercise..." />
          <CommandEmpty>No exercise found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {exercises.map((exercise) => (
              <CommandItem
                key={exercise.name}
                value={exercise.name}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === exercise.name ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <span>{exercise.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({exercise.primaryMuscle})
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 