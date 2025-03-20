import React from "react";
import { Input } from "./ui/input";

interface TimeInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimeInput({ 
  id, 
  value, 
  onChange, 
  placeholder = "HH:MM AM/PM",
  className 
}: TimeInputProps) {
  return (
    <Input
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
} 