import React, { useCallback } from 'react'
import { Upload, FileType, AlertCircle } from 'lucide-react'
import { cn } from '../utils/cn'

interface FileUploaderProps {
    onFileSelect: (file: File) => void
    isParsing: boolean
    error: string | null
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isParsing, error }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onFileSelect(file)
        }
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) {
            onFileSelect(file)
        }
    }, [onFileSelect])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer",
                    "hover:border-primary-400 hover:bg-primary-50/50",
                    error ? "border-red-300 bg-red-50" : "border-slate-200"
                )}
            >
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <Upload className="w-6 h-6" />
                </div>

                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                        {isParsing ? "Parsing data..." : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        CSV or Excel files (.csv, .xlsx, .xls)
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}
