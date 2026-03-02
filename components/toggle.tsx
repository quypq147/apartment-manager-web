import React from 'react'
import { Toggle } from './ui/toggle'
function ThemeToggle() {
  return (
    <Toggle
      id="theme-toggle"
      className="data-[state=on]:bg-blue-500 data-[state=off]:bg-gray-300"
    />
  )
}

export default ThemeToggle