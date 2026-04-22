// src/components/shared/FileUpload.jsx
import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getFileIcon(file) {
  if (file.type.startsWith('image/')) return Image
  if (file.type.startsWith('video/')) return Film
  return FileText
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({
  files = [],
  onChange,
  maxFiles = 5,
  accept = 'image/*,video/*,application/pdf',
  label = 'Upload Files',
}) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    (newFiles) => {
      const fileArray = Array.from(newFiles)
      const combined = [...files, ...fileArray].slice(0, maxFiles)
      onChange?.(combined)
    },
    [files, maxFiles, onChange]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index)
    onChange?.(updated)
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-medium">{label}</p>
        <p className="text-xs text-slate-400 mt-1">
          Drag & drop or click to browse • Max {maxFiles} files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file)
            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2"
              >
                <Icon className="h-5 w-5 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
