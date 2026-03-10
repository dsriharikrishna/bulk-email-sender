/**
 * Gmail Auto-Clicker Content Script
 * This script runs on mail.google.com and automatically clicks the "Send" button
 * if the URL contains the parameter "ext_send=true".
 */

(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldSend = urlParams.get('ext_send') === 'true';

    console.log('[BulkMail] Auto-sender active. Mode: Automation');

    if (!shouldSend) return;

    let sendAttempted = false;
    let stabilizedTime = 0;
    const STABILIZATION_DELAY = 2500; // 2.5 seconds to wait after recipient is detected

    function simulateCtrlEnter() {
        console.log('[BulkMail] Simulating Ctrl+Enter...');
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            ctrlKey: true,
            bubbles: true,
            cancelable: true
        });
        document.activeElement.dispatchEvent(event);
    }

    function isRecipientReady() {
        // Gmail recipient (To) field resolution check
        // We look for "chips" (vR class) or populated data-hovercard pointers
        const toField = document.querySelector('div[name="to"]');
        if (!toField) return false;

        const chips = toField.querySelectorAll('.vR, .afV');
        if (chips.length > 0) return true;

        // Sometimes the text is there but not yet "chipped"
        const text = toField.innerText.trim();
        if (text.includes('@') && text.includes('.')) return true;

        return false;
    }

    function wakeUpCompose() {
        // Force focus on the compose window by clicking the subject or body if focused is elsewhere
        const subjectField = document.querySelector('input[name="subjectbox"]');
        const bodyField = document.querySelector('div[role="textbox"][aria-label*="Body"]');
        
        if (subjectField) subjectField.focus();
        if (bodyField) bodyField.focus();
        
        console.log('[BulkMail] Compose window focused/woken up.');
    }

    function tryClickSend() {
        if (sendAttempted) return checkSendingStatus();

        // 1. Ensure recipient is ready
        if (!isRecipientReady()) {
            console.log('[BulkMail] Waiting for recipient resolution...');
            stabilizedTime = 0;
            return false;
        }

        // 2. Stabilization delay to avoid "No recipient" error
        if (stabilizedTime === 0) {
            console.log('[BulkMail] Recipient detected. Waiting for Gmail to stabilize...');
            wakeUpCompose();
            stabilizedTime = Date.now();
            return false;
        }

        if (Date.now() - stabilizedTime < STABILIZATION_DELAY) {
            return false;
        }

        // 3. Check for any error dialogs that might be blocking (like "No recipient" error)
        const errorDialog = document.querySelector('div[role="alertdialog"]');
        if (errorDialog) {
            const errorText = errorDialog.innerText.toLowerCase();
            if (errorText.includes('recipient') || errorText.includes('not recognized') || errorText.includes('valid email')) {
                console.error('[BulkMail] Invalid email detected. Reporting failure and skipping...');
                chrome.runtime.sendMessage({ type: 'EMAIL_FAILED', reason: 'Invalid or missing email address' });
                const okBtn = errorDialog.querySelector('button');
                if (okBtn) okBtn.click();
                setTimeout(() => window.close(), 500); // Close to trigger next send
                return true; // Stop current interval
            } else {
                console.warn('[BulkMail] Unknown error dialog detected. Resetting stabilization...');
                const okBtn = errorDialog.querySelector('button');
                if (okBtn) okBtn.click();
                stabilizedTime = 0;
                return false;
            }
        }

        // 4. Find and Trigger the Send button
        const selectors = [
            'div[role="button"].aoO',
            'div[role="button"][aria-label^="Send"]'
        ];

        let sendBtn = null;
        for (const selector of selectors) {
            const buttons = document.querySelectorAll(selector);
            for (const btn of buttons) {
                if (btn.offsetWidth > 0 && !btn.getAttribute('aria-label')?.includes('More')) {
                    sendBtn = btn;
                    break;
                }
            }
            if (sendBtn) break;
        }

        if (sendBtn) {
            console.log('[BulkMail] RECIPIENT VALIDATED. Sending now...');
            
            // Interaction Sequence
            simulateCtrlEnter();
            
            const eventOptions = { bubbles: true, cancelable: true, view: window };
            sendBtn.dispatchEvent(new MouseEvent('mousedown', eventOptions));
            sendBtn.dispatchEvent(new MouseEvent('mouseup', eventOptions));
            sendBtn.click();
            
            sendAttempted = true;
            return false;
        }

        return false;
    }

    function checkSendingStatus() {
        const feedback = document.body.innerText;
        if (feedback.includes('Sending') || feedback.includes('Message sent') || feedback.includes('Sent')) {
            console.log('[BulkMail] SEND CONFIRMED. Success.');
            
            setTimeout(() => {
                window.close();
            }, 2000);
            return true;
        }
        return false;
    }

    let attempts = 0;
    const maxAttempts = 200; // 40 seconds
    
    const interval = setInterval(() => {
        attempts++;
        if (tryClickSend()) {
            clearInterval(interval);
        } else if (attempts >= maxAttempts) {
            console.error('[BulkMail] Timeout: Could not complete automation.');
            clearInterval(interval);
        }
    }, 200)
})();
