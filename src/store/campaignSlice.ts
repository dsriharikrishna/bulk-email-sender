import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Contact, EmailTemplate } from '../types/contact';

export interface CampaignState {
    contacts: Contact[];
    queue: Contact[];
    currentIndex: number;
    isSending: boolean;
    isPaused: boolean;
    template: EmailTemplate;
    delay: number;
}

const initialState: CampaignState = {
    contacts: [],
    queue: [],
    currentIndex: 0,
    isSending: false,
    isPaused: false,
    template: {
        subject: '',
        body: '',
        sendingMethod: 'gmail',
        resumeUrl: '',
        portfolioUrl: ''
    },
    delay: 1,
};

const campaignSlice = createSlice({
    name: 'campaign',
    initialState,
    reducers: {
        setContacts: (state, action: PayloadAction<Contact[]>) => {
            state.contacts = action.payload;
        },
        setQueue: (state, action: PayloadAction<Contact[]>) => {
            state.queue = action.payload;
        },
        setCurrentIndex: (state, action: PayloadAction<number>) => {
            state.currentIndex = action.payload;
        },
        setIsSending: (state, action: PayloadAction<boolean>) => {
            state.isSending = action.payload;
        },
        setIsPaused: (state, action: PayloadAction<boolean>) => {
            state.isPaused = action.payload;
        },
        setTemplate: (state, action: PayloadAction<EmailTemplate>) => {
            state.template = action.payload;
        },
        setDelay: (state, action: PayloadAction<number>) => {
            state.delay = action.payload;
        },
        syncFromBackground: (state, action: PayloadAction<Partial<CampaignState>>) => {
            if (action.payload.queue !== undefined) state.queue = action.payload.queue;
            if (action.payload.currentIndex !== undefined) state.currentIndex = action.payload.currentIndex;
            if (action.payload.isSending !== undefined) state.isSending = action.payload.isSending;
            if (action.payload.isPaused !== undefined) state.isPaused = action.payload.isPaused;
        },
        clearCampaignState: (state) => {
            state.contacts = [];
            state.queue = [];
            state.currentIndex = 0;
            state.isSending = false;
            state.isPaused = false;
        }
    },
});

export const {
    setContacts,
    setQueue,
    setCurrentIndex,
    setIsSending,
    setIsPaused,
    setTemplate,
    setDelay,
    syncFromBackground,
    clearCampaignState
} = campaignSlice.actions;

export default campaignSlice.reducer;
