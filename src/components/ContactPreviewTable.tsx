import React from 'react'
import { Contact } from '../types/contact'
import { cn } from '../utils/cn'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface ContactPreviewTableProps {
    contacts: Contact[]
}

export const ContactPreviewTable: React.FC<ContactPreviewTableProps> = ({ contacts }) => {
    if (contacts.length === 0) return null

    return (
        <div className="flex flex-col gap-2 overflow-hidden bg-white border border-slate-200 rounded-xl">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-700">Preview Contacts ({contacts.length})</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                            <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {contacts.slice(0, 10).map((contact) => (
                            <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-2 text-sm text-slate-700 font-medium">{contact.name}</td>
                                <td className="px-4 py-2 text-sm text-slate-600">{contact.email}</td>
                                <td className="px-4 py-2 text-sm text-slate-600">{contact.company}</td>
                                <td className="px-4 py-2 text-sm text-slate-500 italic">{contact.title || '-'}</td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-1.5">
                                        {contact.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-slate-400" />}
                                        {contact.status === 'Sent' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                        {contact.status === 'Failed' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                        <span className={cn(
                                            "text-xs font-medium",
                                            contact.status === 'Pending' && "text-slate-500",
                                            contact.status === 'Sent' && "text-green-600",
                                            contact.status === 'Failed' && "text-red-600"
                                        )}>
                                            {contact.status}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {contacts.length > 10 && (
                <div className="px-4 py-2 bg-slate-50 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                    Showing first 10 contacts...
                </div>
            )}
        </div>
    )
}
