'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ColorPickerProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ColorPicker({ id, label, value, onChange, placeholder }: ColorPickerProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center space-x-2 mt-1">
        <Input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 p-1 border rounded cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}