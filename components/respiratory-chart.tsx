'use client'

import { useEffect, useRef } from 'react'

export function RespiratoryChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw the chart
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the gray bars
    const barWidth = canvas.width / 15
    const barGap = 2
    const maxBarHeight = canvas.height * 0.8

    for (let i = 0; i < 12; i++) {
      const height = Math.random() * maxBarHeight * 0.7 + maxBarHeight * 0.3
      const x = i * (barWidth + barGap)

      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(x, canvas.height - height, barWidth, height)
    }

    // Draw the blue bar
    const blueBarIndex = 9
    const blueBarHeight = maxBarHeight
    const blueBarX = blueBarIndex * (barWidth + barGap)

    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(
      blueBarX,
      canvas.height - blueBarHeight,
      barWidth,
      blueBarHeight,
    )
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
