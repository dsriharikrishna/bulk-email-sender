import { useCallback, useEffect } from 'react'
import { Contact } from '../types/contact'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    setQueue,
    setIsSending,
    setIsPaused,
    setCurrentIndex,
    syncFromBackground
} from '../store/campaignSlice'

declare const chrome: any;

export const useBulkSender = () => {
    const dispatch = useAppDispatch()
    const { contacts, isSending, currentIndex, delay, template } = useAppSelector(state => state.campaign)

    // Keep local queue in sync with loaded contacts only if idle
    useEffect(() => {
        if (!isSending) {
            dispatch(setQueue(contacts));
            dispatch(setCurrentIndex(0));
        }
    }, [contacts, isSending, dispatch]);

    // Simple listener for background progress updates
    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.type === 'STATE_UPDATE') {
                const { state } = message;
                dispatch(syncFromBackground(state));
            }
        };

        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            // Grab initial state on mount
            chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state: any) => {
                if (state && state.queue && state.queue.length > 0) {
                    dispatch(syncFromBackground(state));
                }
            });

            chrome.runtime.onMessage.addListener(handleMessage);
            return () => chrome.runtime.onMessage.removeListener(handleMessage);
        }
    }, [dispatch]);

    const personalize = useCallback((text: string, contact: Contact) => {
        return text
            .replace(/{{name}}/g, contact.name)
            .replace(/{{company}}/g, contact.company)
            .replace(/{{title}}/g, contact.title || '')
            .replace(/{{resume}}/g, template.resumeUrl || '')
            .replace(/{{portfolio}}/g, template.portfolioUrl || '')
    }, [template])

    const startSending = () => {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            alert("Chrome Extension API not found! Background sending requires this app to be loaded as a Chrome Extension. Please load the 'dist' folder in chrome://extensions.");
            return;
        }

        // Always send the latest contacts to the background worker directly
        const personalizedQueue = contacts.map(contact => ({
            ...contact,
            subject: personalize(template.subject, contact),
            body: personalize(template.body, contact)
        }));

        chrome.runtime.sendMessage({
            type: 'START_CAMPAIGN',
            queue: personalizedQueue,
            delay: delay,
            startIndex: currentIndex >= contacts.length ? 0 : currentIndex
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error communicating with background script:", chrome.runtime.lastError);
                alert("Error connecting to the background worker. Please refresh the extension in chrome://extensions/.");
            }
        });

        dispatch(setIsSending(true));
        dispatch(setIsPaused(false));
        dispatch(setQueue(personalizedQueue)); // Optimistic UI update
    }

    const pauseSending = () => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ type: 'PAUSE_CAMPAIGN' });
        }
        dispatch(setIsPaused(true));
    }

    const resumeSending = () => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ type: 'RESUME_CAMPAIGN' });
        }
        dispatch(setIsPaused(false));
        dispatch(setIsSending(true));
    }

    const stopSending = () => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ type: 'STOP_CAMPAIGN' });
        }
        dispatch(setIsSending(false));
        dispatch(setIsPaused(false));
    }

    const resetQueueAction = () => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ type: 'RESET_CAMPAIGN' });
        }
        dispatch(setIsSending(false));
        dispatch(setIsPaused(false));
        dispatch(setCurrentIndex(0));
        dispatch(setQueue(contacts.map(c => ({ ...c, status: 'Pending' }))));
    }

    const sendOne = (_contactId: string) => {
        // Handled by the background state sync if user clicks through the status table
    }

    return {
        startSending, pauseSending, resumeSending, stopSending, resetQueue: resetQueueAction, sendOne
    }
}
