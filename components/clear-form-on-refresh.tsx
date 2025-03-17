"use client"

import { useEffect } from 'react'
import { useFormContext } from '@/contexts/FormContext'

export function ClearFormOnRefresh() {
  const { clearFormData } = useFormContext()

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearFormData()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [clearFormData])

  return null
}

