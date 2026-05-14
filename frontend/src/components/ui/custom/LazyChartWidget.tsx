import { useState, useEffect, type ComponentType } from 'react'
import type { ChartWidgetProps } from './ChartWidget'

let ChartComponent: ComponentType<ChartWidgetProps> | null = null
let loadPromise: Promise<void> | null = null

function ChartLoadingSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-sm text-gray-500">Loading chart...</p>
      </div>
    </div>
  )
}

export function LazyChartWidget(props: ChartWidgetProps) {
  // 1. Wrap the initial state in a callback
  const [Component, setComponent] = useState<ComponentType<ChartWidgetProps> | null>(() => ChartComponent)

  useEffect(() => {
    if (ChartComponent) {
      // 2. Wrap the setter in a callback
      setComponent(() => ChartComponent)
      return
    }

    if (!loadPromise) {
      loadPromise = import('./ChartWidget').then(m => {
        ChartComponent = m.ChartWidget
      })
    }

    let cancelled = false
    loadPromise.then(() => {
      if (!cancelled) {
        // 3. Wrap the setter in a callback
        setComponent(() => ChartComponent)
      }
    })

    return () => { cancelled = true }
  }, [])

  if (!Component) {
    return <ChartLoadingSkeleton height={props.height} />
  }

  return <Component {...props} />
}
