"use client"

import { useState, useEffect } from "react"

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches)
  }, [])
  return isTouch
}
