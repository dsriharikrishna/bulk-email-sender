import React from 'react'
import { FileText, Paperclip, X } from 'lucide-react'
import { Attachment } from '../types/contact'

interface AttachmentUploaderProps {
    attachments: Attachment[]
    onAdd: (file: File, type: 'Resume' | 'Cover Letter') => void
    onRemove: (name: string) => void
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ attachments, onAdd, onRemove }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'Resume' | 'Cover Letter') => {
        const file = e.target.files?.[0]
        if (file) {
            onAdd(file, type)
        }
    }

    const hasResume = attachments.some(a => a.type === 'Resume')
    const hasCoverLetter = attachments.some(a => a.type === 'Cover Letter')

    return (
        <div className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attachments</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resume Upload */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-600">Resume (Required)</label>
                    {!hasResume ? (
                        <div className="relative border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={(e) => handleFileChange(e, 'Resume')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Paperclip className="w-5 h-5 text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">Upload Resume</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                                    {attachments.find(a => a.type === 'Resume')?.name}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemove(attachments.find(a => a.type === 'Resume')!.name)}
                                className="p-1 hover:bg-primary-100 rounded text-primary-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Cover Letter Upload */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-600">Cover Letter (Optional)</label>
                    {!hasCoverLetter ? (
                        <div className="relative border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={(e) => handleFileChange(e, 'Cover Letter')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Paperclip className="w-5 h-5 text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">Upload Cover Letter</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                                    {attachments.find(a => a.type === 'Cover Letter')?.name}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemove(attachments.find(a => a.type === 'Cover Letter')!.name)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {!hasResume && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">
                    Resume attachment is required to start sending
                </p>
            )}
        </div>
    )
}
