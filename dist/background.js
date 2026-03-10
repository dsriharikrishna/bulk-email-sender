/**
 * Background Service Worker for Bulk Email Sender
 * Handles the campaign loop and tab management.
 */

let campaignState = {
    isSending: false,
    isPaused: false,
    currentIndex: 0,
    queue: [],
    delay: 1,
    currentTabId: null,
    currentContactId: null,
    isProcessing: false
};

// Initialize from storage
chrome.storage.local.get(['bm_campaign'], (result) => {
    if (result.bm_campaign) {
        campaignState = { ...campaignState, ...result.bm_campaign };
        console.log('[BulkMail Background] State loaded:', campaignState);
    }
});

function saveState() {
    chrome.storage.local.set({ bm_campaign: campaignState });
}

function broadcastState() {
    chrome.runtime.sendMessage({ type: 'STATE_UPDATE', state: campaignState }).catch(() => {
        // Popup might be closed, ignore
    });
}

async function sendNext() {
    if (campaignState.isProcessing) return;
    if (!campaignState.isSending || campaignState.isPaused) return;
    if (campaignState.currentIndex >= campaignState.queue.length) {
        campaignState.isSending = false;
        campaignState.isProcessing = false;
        saveState();
        broadcastState();
        return;
    }

    campaignState.isProcessing = true;
    const contact = campaignState.queue[campaignState.currentIndex];
    campaignState.currentContactId = contact.id;
    
    // Mark as sending
    campaignState.queue[campaignState.currentIndex].status = 'Sending';
    saveState();
    broadcastState();

    try {
        const url = `https://mail.google.com/mail/?ext_send=true&view=cm&fs=1&to=${encodeURIComponent(contact.email)}&su=${encodeURIComponent(contact.subject)}&body=${encodeURIComponent(contact.body)}`;
        
        chrome.tabs.create({ url, active: true }, (tab) => {
            campaignState.currentTabId = tab.id;
            saveState();
            broadcastState();
        });
    } catch (error) {
        console.error('[BulkMail Background] Failed to create tab:', error);
        campaignState.queue[campaignState.currentIndex].status = 'Failed';
        campaignState.currentIndex++;
        campaignState.isProcessing = false;
        saveState();
        broadcastState();
    }
}

// Listen for tab removals
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === campaignState.currentTabId) {
        console.log(`[BulkMail Background] Tab ${tabId} closed. Proceeding...`);
        
        // Finalize current contact (only mark Sent if not already marked Failed by error listener)
        const contactIndex = campaignState.queue.findIndex(c => c.id === campaignState.currentContactId);
        if (contactIndex !== -1) {
            if (campaignState.queue[contactIndex].status !== 'Failed') {
                campaignState.queue[contactIndex].status = 'Sent';
                campaignState.queue[contactIndex].sentTime = new Date().toLocaleTimeString();
            }
        }

        campaignState.currentIndex++;
        campaignState.currentTabId = null;
        campaignState.currentContactId = null;
        campaignState.isProcessing = false;
        
        saveState();
        broadcastState();

        if (campaignState.isSending && !campaignState.isPaused) {
            console.log(`[BulkMail Background] Waiting ${campaignState.delay}s for next send...`);
            setTimeout(() => {
                sendNext();
            }, campaignState.delay * 1000);
        }
    }
});

// Listen for messages from Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'GET_STATE':
            sendResponse(campaignState);
            break;

        case 'START_CAMPAIGN':
            campaignState.queue = message.queue;
            campaignState.delay = message.delay;
            campaignState.currentIndex = message.startIndex || 0;
            campaignState.isSending = true;
            campaignState.isPaused = false;
            campaignState.isProcessing = false;
            saveState();
            sendNext();
            sendResponse({ status: 'ok' });
            break;

        case 'PAUSE_CAMPAIGN':
            campaignState.isPaused = true;
            saveState();
            broadcastState();
            sendResponse({ status: 'ok' });
            break;

        case 'RESUME_CAMPAIGN':
            campaignState.isPaused = false;
            campaignState.isSending = true;
            saveState();
            sendNext();
            sendResponse({ status: 'ok' });
            break;

        case 'STOP_CAMPAIGN':
            campaignState.isSending = false;
            campaignState.isPaused = false;
            campaignState.isProcessing = false;
            saveState();
            broadcastState();
            sendResponse({ status: 'ok' });
            break;

        case 'RESET_CAMPAIGN':
            campaignState = {
                ...campaignState,
                isSending: false,
                isPaused: false,
                currentIndex: 0,
                queue: [],
                currentTabId: null,
                currentContactId: null,
                isProcessing: false
            };
            saveState();
            broadcastState();
            sendResponse({ status: 'ok' });
            break;

        case 'EMAIL_FAILED':
            console.warn(`[BulkMail Background] Received failure report: ${message.reason}`);
            if (campaignState.currentContactId) {
                const contactIndex = campaignState.queue.findIndex(c => c.id === campaignState.currentContactId);
                if (contactIndex !== -1) {
                    campaignState.queue[contactIndex].status = 'Failed';
                    campaignState.queue[contactIndex].error = message.reason || 'Failed to send';
                    saveState();
                    broadcastState();
                }
            }
            sendResponse({ status: 'ok' });
            break;
    }
    return true; // Keep message channel open for async response
});
