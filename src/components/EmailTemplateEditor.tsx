import React from 'react'
import { EmailTemplate } from '../types/contact'

interface EmailTemplateEditorProps {
    template: EmailTemplate
    onChange: (template: EmailTemplate) => void
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ template, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        onChange({ ...template, [name]: value })
    }

    const setSendingMethod = (method: 'gmail' | 'mailto') => {
        onChange({ ...template, sendingMethod: method })
    }

    const insertVariable = (variable: string) => {
        onChange({ ...template, body: template.body + ` {{${variable}}}` })
    }

    return (
        <div className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sending Method</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setSendingMethod('gmail')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${template.sendingMethod === 'gmail'
                                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        Gmail (New Tab)
                    </button>
                    <button
                        type="button"
                        onClick={() => setSendingMethod('mailto')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${template.sendingMethod === 'mailto'
                                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        Default Mail App
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 font-medium">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resume URL</label>
                    <input
                        type="url"
                        name="resumeUrl"
                        value={template.resumeUrl || ''}
                        onChange={handleChange}
                        placeholder="Link to your resume"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all text-xs font-medium"
                    />
                </div>
                <div className="flex flex-col gap-1.5 font-medium">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio URL</label>
                    <input
                        type="url"
                        name="portfolioUrl"
                        value={template.portfolioUrl || ''}
                        onChange={handleChange}
                        placeholder="Link to your portfolio"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all text-xs font-medium"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 font-medium">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Subject</label>
                <input
                    type="text"
                    name="subject"
                    value={template.subject}
                    onChange={handleChange}
                    placeholder="I'm interested in working at {{company}}"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all text-sm font-medium"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Body</label>
                <textarea
                    name="body"
                    value={template.body}
                    onChange={handleChange}
                    placeholder="Hello {{name}}, I hope you're doing well..."
                    rows={10}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all text-sm min-h-[200px] resize-none font-medium"
                />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-2">Variables:</span>
                {['name', 'company', 'title', 'resume', 'portfolio'].map((variable) => (
                    <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="px-2 py-1 text-[11px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                    >
                        &#123;&#123;{variable}&#125;&#125;
                    </button>
                ))}
            </div>
        </div>
    )
}
