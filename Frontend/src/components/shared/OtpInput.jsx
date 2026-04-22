// src/components/shared/OtpInput.jsx
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'

export default function OtpInput({ length = 6, value = '', onChange, disabled = false }) {
  const [otp, setOtp] = useState(value.split('').concat(Array(length).fill('')).slice(0, length))
  const inputRefs = useRef([])

  useEffect(() => {
    if (value) {
      setOtp(value.split('').concat(Array(length).fill('')).slice(0, length))
    }
  }, [value, length])

  const handleChange = (index, e) => {
    const val = e.target.value
    if (!/^\d*$/.test(val)) return

    const newOtp = [...otp]
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)
    onChange?.(newOtp.join(''))

    // Auto-focus next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const newOtp = pastedData.split('').concat(Array(length).fill('')).slice(0, length)
    setOtp(newOtp)
    onChange?.(newOtp.join(''))
    const focusIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }, (_, i) => (
        <Input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-semibold border-2 focus:border-primary focus:ring-primary"
        />
      ))}
    </div>
  )
}
