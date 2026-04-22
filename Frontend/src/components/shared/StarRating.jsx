// src/components/shared/StarRating.jsx
import { Star } from 'lucide-react'
import { useState } from 'react'

export default function StarRating({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
}) {
  const [hovered, setHovered] = useState(0)
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-slate-300'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-slate-600 font-medium">{value.toFixed(1)}</span>
      )}
    </div>
  )
}
