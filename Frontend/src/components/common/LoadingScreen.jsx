// src/components/common/LoadingScreen.jsx
import { Loader2 } from 'lucide-react'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
