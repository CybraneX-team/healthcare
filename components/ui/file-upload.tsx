import * as React from 'react'
import { cn } from '@/lib/utils'
import { useState, useImperativeHandle } from 'react'

export interface FileUploadProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      label = 'Choose a file',
      onChange,
      multiple,
      accept,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    // This exposes the internal ref to parent components (important for Safari + Next.js)
    useImperativeHandle(ref, () => inputRef.current!)

    const handleClick = () => {
      inputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onChange) {
        const event = {
          target: {
            files: e.dataTransfer.files,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>

        onChange(event)
      }
    }

    return (
      <div
        className={cn(
          'file-upload-container',
          isDragging && 'file-upload-dragging',
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="folder">
          <div className="front-side">
            <div className="tip"></div>
            <div className="cover"></div>
          </div>
          <div className="back-side cover"></div>
        </div>
        <label className="custom-file-upload" onClick={handleClick}>
          <input
            type="file"
            ref={inputRef}
            style={{ position: 'absolute', left: '-9999px' }} // NOT display:none
            onChange={(e) => {
              console.log('✅ File input change triggered', e.target.files) // Add this for Safari test
              onChange?.(e)
            }}
            multiple={multiple}
            accept={accept}
            {...props}
          />
          {isDragging ? 'Drop files here' : label}
        </label>
      </div>
    )
  },
)

FileUpload.displayName = 'FileUpload'

export { FileUpload }
