import React from 'react'
import { Contact } from '../types/contact'
import { cn } from '../utils/cn'
import { CheckCircle, XCircle, Clock, Send, AlertCircle } from 'lucide-react'

interface EmailStatusTableProps {
    contacts: Contact[]
}

export const EmailStatusTable: React.FC<EmailStatusTableProps> = ({ contacts }) => {
    return (
        <div className="flex flex-col gap-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Delivery Logs</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Real-time status of your campaign</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold text-slate-500">{contacts.filter(c => c.status === 'Sent').length} SENT</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold text-slate-500">{contacts.filter(c => c.status === 'Failed').length} FAILED</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/30">
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {contacts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Send className="w-8 h-8 opacity-20" />
                                        <p className="text-xs font-medium italic">No emails in queue</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact.id} className={cn(
                                    "hover:bg-slate-50/50 transition-colors",
                                    contact.status === 'Sending' && "bg-primary-50/30"
                                )}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{contact.name}</span>
                                            <span className="text-xs text-slate-500">{contact.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-slate-600">{contact.company}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {contact.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-slate-300" />}
                                            {contact.status === 'Sending' && <RefreshCw className="w-3.5 h-3.5 text-primary-500 animate-spin" />}
                                            {contact.status === 'Sent' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                            {contact.status === 'Failed' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-wider",
                                                contact.status === 'Pending' && "text-slate-400",
                                                contact.status === 'Sending' && "text-primary-600",
                                                contact.status === 'Sent' && "text-green-600",
                                                contact.status === 'Failed' && "text-red-600"
                                            )}>
                                                {contact.status}
                                            </span>
                                        </div>
                                        {contact.error && (
                                            <div className="flex items-center gap-1 mt-1 text-[9px] text-red-500 font-bold">
                                                <AlertCircle className="w-2.5 h-2.5" />
                                                <span>{contact.error}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                                            {contact.sentTime || '--:--'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {contacts.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Total Queue: {contacts.length}
                    </span>
                </div>
            )}
        </div>
    )
}

function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
