import { useState, useMemo, useEffect } from 'react'
import { Upload, Mail, Send, History, BarChart3, AlertCircle } from 'lucide-react'
import { FileUploader } from './components/FileUploader'
import { ContactPreviewTable } from './components/ContactPreviewTable'
import { EmailTemplateEditor } from './components/EmailTemplateEditor'
import { SendController } from './components/SendController'
import { EmailStatusTable } from './components/EmailStatusTable'
import { useCSVParser } from './hooks/useCSVParser'
import { useBulkSender } from './hooks/useBulkSender'
import { cn } from './utils/cn'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { setTemplate, setDelay, clearCampaignState } from './store/campaignSlice'

type Page = 'dashboard' | 'upload' | 'compose' | 'send' | 'logs'

declare const chrome: any;

export default function App() {
    const dispatch = useAppDispatch()
    const { contacts, queue, isSending, isPaused, currentIndex, template, delay } = useAppSelector(state => state.campaign)

    const [currentPage, setCurrentPage] = useState<Page>('dashboard')
    const [isLoaded, setIsLoaded] = useState(false)

    // Load all state from chrome.storage on mount
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['bm_page', 'bm_template', 'bm_delay', 'bm_contacts'], (result: any) => {
                if (result.bm_page) setCurrentPage(result.bm_page)
                if (result.bm_template) dispatch(setTemplate(result.bm_template))
                if (result.bm_delay) dispatch(setDelay(result.bm_delay))
                setIsLoaded(true)
            })
        } else {
            setIsLoaded(true)
        }
    }, [dispatch])

    // Persist all state to chrome.storage
    useEffect(() => {
        if (!isLoaded) return;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({
                bm_page: currentPage,
                bm_template: template,
                bm_delay: delay,
                bm_contacts: contacts /* useCSVParser used to do this, doing it here centrally */
            })
        }
    }, [currentPage, template, delay, contacts, isLoaded])

    const { error: parseError, isParsing, parseFile, clearData } = useCSVParser()

    const {
        startSending,
        pauseSending,
        resumeSending,
        stopSending,
        resetQueue,
        sendOne
    } = useBulkSender()

    const canStart = useMemo(() => {
        return template.subject.length > 0 &&
            template.body.length > 0 &&
            contacts.length > 0
    }, [template, contacts])

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all data? This will reset your contacts, template, and progress.')) {
            setCurrentPage('dashboard')
            clearData()
            dispatch(clearCampaignState())

            // Clear storage
            localStorage.clear()
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.clear()
            }
        }
    }

    const stats = useMemo(() => ({
        total: queue.length,
        sent: queue.filter(c => c.status === 'Sent').length,
        failed: queue.filter(c => c.status === 'Failed').length,
        pending: queue.filter(c => c.status === 'Pending').length,
    }), [queue])

    const navItems = [
        { id: 'dashboard', label: 'Home', icon: BarChart3 },
        { id: 'upload', label: 'Contacts', icon: Upload },
        { id: 'compose', label: 'Compose', icon: Mail },
        { id: 'send', label: 'Run', icon: Send },
        { id: 'logs', label: 'Logs', icon: History },
    ]

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans relative">
            {/* Header - Compact */}
            <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-5 shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black italic shadow-md shadow-primary-100 text-xs">
                        B
                    </div>
                    <span className="font-black text-sm tracking-tight text-slate-800 italic uppercase">Bulk<span className="text-primary-600">Mail</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleClearAll}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest leading-none border border-slate-200 hover:border-red-200 px-2 py-1 rounded-md"
                    >
                        Clear All
                    </button>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isSending ? (isPaused ? "bg-amber-500" : "bg-green-500 animate-pulse") : "bg-slate-300"
                        )} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {isSending ? (isPaused ? "Paused" : "Running") : "Idle"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 pb-24 scroll-smooth">
                <div className="flex flex-col gap-5">

                    {currentPage === 'dashboard' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-primary-600 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl shadow-primary-100 group">
                                <div className="relative z-10">
                                    <h2 className="text-lg font-black mb-1 italic">Ready to blast?</h2>
                                    <p className="text-primary-100 text-[10px] font-medium mb-4 max-w-[200px] leading-relaxed">
                                        Personalized recruitment campaigns in minutes.
                                    </p>
                                    <button
                                        onClick={() => setCurrentPage('upload')}
                                        className="bg-white text-primary-600 px-4 py-1.5 rounded-full font-bold text-[10px] shadow-lg hover:bg-primary-50 transition-all active:scale-95"
                                    >
                                        GET STARTED →
                                    </button>
                                </div>
                                <Mail className="absolute -right-4 -bottom-4 w-24 h-24 text-primary-500/20 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-xl font-black text-slate-800">{stats.total}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sent</p>
                                    <p className="text-xl font-black text-green-600">{stats.sent}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Failed</p>
                                    <p className="text-xl font-black text-red-600">{stats.failed}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                                    <p className="text-xl font-black text-primary-600">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentPage === 'upload' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <FileUploader
                                onFileSelect={parseFile}
                                isParsing={isParsing}
                                error={parseError}
                            />
                            {contacts.length > 0 && (
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <ContactPreviewTable contacts={contacts} />
                                    <div className="flex justify-between items-center mt-4">
                                        <button onClick={() => { clearData(); resetQueue(); }} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">
                                            Clear All
                                        </button>
                                        <button onClick={() => setCurrentPage('compose')} className="bg-primary-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-primary-50 hover:bg-primary-700 transition-all active:scale-95">
                                            CONTINUE →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentPage === 'compose' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <EmailTemplateEditor
                                template={template}
                                onChange={(t) => dispatch(setTemplate(t))}
                            />
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Delay (Sec)</label>
                                    <span className="text-xs font-black text-primary-600">{delay}s</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={delay}
                                    onChange={(e) => dispatch(setDelay(parseInt(e.target.value)))}
                                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setCurrentPage('send')}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-lg shadow-primary-50 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    GO TO CAMPAIGN →
                                </button>
                            </div>
                        </div>
                    )}

                    {currentPage === 'send' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <SendController
                                isSending={isSending}
                                isPaused={isPaused}
                                currentIndex={currentIndex}
                                total={queue.length}
                                onStart={startSending}
                                onPause={pauseSending}
                                onResume={resumeSending}
                                onStop={stopSending}
                                onReset={resetQueue}
                                canStart={canStart}
                            />

                            <EmailStatusTable contacts={queue} onCompose={sendOne} />

                            {!canStart && (
                                <div className="p-4 bg-amber-50 border border-amber-100/50 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <div>
                                        <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Incomplete</h4>
                                        <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">Contacts and template are required.</p>
                                        <button
                                            onClick={() => setCurrentPage('compose')}
                                            className="text-[9px] font-black uppercase text-amber-900 mt-2 flex items-center gap-1 group"
                                        >
                                            RECHECK <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentPage === 'logs' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Campaign History</h3>
                                <div className="text-[8px] font-bold text-slate-400 uppercase">{queue.filter(c => c.status !== 'Pending').length} Entries</div>
                            </div>
                            <EmailStatusTable 
                                contacts={queue.filter(c => c.status !== 'Pending')} 
                                onCompose={sendOne}
                            />
                        </div>
                    )}

                </div>
            </main>

            {/* Bottom Navigation - Sleek popup style */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-2 z-50">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id as Page)}
                        className="flex flex-col items-center justify-center group flex-1"
                    >
                        <div className={cn(
                            "p-2 rounded-xl transition-all duration-300 group-active:scale-90",
                            currentPage === item.id
                                ? "bg-primary-600 text-white shadow-lg shadow-primary-200 -translate-y-1"
                                : "text-slate-400 hover:text-slate-600"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                            "text-[8px] font-black mt-1 uppercase tracking-widest transition-all duration-300",
                            currentPage === item.id
                                ? "text-primary-600 opacity-100"
                                : "text-slate-400 opacity-60"
                        )}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>
        </div>
    )
}
