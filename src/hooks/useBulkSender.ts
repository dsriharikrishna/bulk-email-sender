import { useState, useCallback, useRef, useEffect } from 'react'
import { Contact } from '../types/contact'

export const useBulkSender = (contacts: Contact[], delay: number) => {
    const [queue, setQueue] = useState<Contact[]>(contacts)
    const [isSending, setIsSending] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const timerRef = useRef<any>(null)

    useEffect(() => {
        setQueue(contacts)
    }, [contacts])

    const sendNext = useCallback(async () => {
        if (currentIndex >= queue.length || isPaused || !isSending) {
            if (currentIndex >= queue.length) {
                setIsSending(false)
            }
            return
        }

        // Send signal

        // Update status to Sending
        setQueue(prev => prev.map((c, i) => i === currentIndex ? { ...c, status: 'Sending' } : c))

        // Simulate sending email (since we don't have a real SMTP backend here)
        // In a real app, this would be a call to an API or chrome.runtime.sendMessage
        await new Promise(resolve => setTimeout(resolve, 500))

        // Update status to Sent
        setQueue(prev => prev.map((c, i) =>
            i === currentIndex
                ? { ...c, status: 'Sent' as const, sentTime: new Date().toLocaleTimeString() }
                : c
        ))

        setCurrentIndex(prev => prev + 1)

        // Schedule next with delay
        timerRef.current = setTimeout(() => {
            sendNext()
        }, delay * 1000)
    }, [currentIndex, queue, isSending, isPaused, delay])

    const startSending = () => {
        setIsSending(true)
        setIsPaused(false)
    }

    const pauseSending = () => {
        setIsPaused(true)
        if (timerRef.current) clearTimeout(timerRef.current)
    }

    const resumeSending = () => {
        setIsPaused(false)
        setIsSending(true)
    }

    const stopSending = () => {
        setIsSending(false)
        setIsPaused(false)
        if (timerRef.current) clearTimeout(timerRef.current)
    }

    const resetQueue = () => {
        stopSending()
        setCurrentIndex(0)
        setQueue(contacts.map(c => ({ ...c, status: 'Pending' })))
    }

    useEffect(() => {
        if (isSending && !isPaused) {
            sendNext()
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [isSending, isPaused, sendNext])

    return {
        queue,
        isSending,
        isPaused,
        currentIndex,
        startSending,
        pauseSending,
        resumeSending,
        stopSending,
        resetQueue
    }
}
