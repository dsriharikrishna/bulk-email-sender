import React from 'react'
import { Play, Pause, Square, SkipForward, RefreshCw } from 'lucide-react'
import { cn } from '../utils/cn'

interface SendControllerProps {
    isSending: boolean
    isPaused: boolean
    currentIndex: number
    total: number
    onStart: () => void
    onPause: () => void
    onResume: () => void
    onStop: () => void
    onReset: () => void
    canStart: boolean
}

export const SendController: React.FC<SendControllerProps> = ({
    isSending,
    isPaused,
    currentIndex,
    total,
    onStart,
    onPause,
    onResume,
    onStop,
    onReset,
    canStart
}) => {
    const percentage = total > 0 ? Math.round((currentIndex / total) * 100) : 0

    return (
        <div className="flex flex-col gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-lg ring-1 ring-slate-100">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Sending Engine</h2>
                    <p className="text-xs text-slate-500 font-medium">Control your email queue</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-primary-600">{percentage}%</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentIndex} / {total} SENT</p>
                </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                    className="bg-primary-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!isSending ? (
                    <button
                        onClick={onStart}
                        disabled={!canStart || total === 0}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md active:scale-95",
                            canStart && total > 0
                                ? "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-200"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        START CAMPAIGN
                    </button>
                ) : (
                    <>
                        {isPaused ? (
                            <button
                                onClick={onResume}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 transition-all shadow-md shadow-green-100 active:scale-95"
                            >
                                <SkipForward className="w-4 h-4 fill-current" />
                                RESUME
                            </button>
                        ) : (
                            <button
                                onClick={onPause}
                                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-full font-bold text-sm hover:bg-amber-600 transition-all shadow-md shadow-amber-100 active:scale-95"
                            >
                                <Pause className="w-4 h-4 fill-current" />
                                PAUSE
                            </button>
                        )}

                        <button
                            onClick={onStop}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-full font-bold text-sm hover:bg-red-600 transition-all shadow-md shadow-red-100 active:scale-95"
                        >
                            <Square className="w-3.5 h-3.5 fill-current" />
                            STOP
                        </button>
                    </>
                )}

                <button
                    onClick={onReset}
                    disabled={isSending && !isPaused}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-full font-bold text-sm hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className="w-4 h-4" />
                    RESET
                </button>
            </div>
        </div>
    )
}
