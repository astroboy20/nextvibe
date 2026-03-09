import { AutomatedReminder, EventGamificationData } from "@/types/event.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export enum EVENTGAMIFICATION_MODE {
    PRE_EVENT = "pre-event",
    MAIN_EVENT = "main-event",
    COMBINED = "mixed",
}

export type FormValues = {
    // Step 1
    flier: string | null;
    promotionalVideo: string | null;
    backdrop: string | null;
    name: string;
    description: string;
    category: string;
    location: string;
    promoteEvent: boolean;
    isMultiDay: boolean;
    startDateTime: string;
    endDateTime: string;
    coordinates: { lon: number; lat: number };
    tags: string[];
    eventMode: "onsite" | "hybrid" | "virtual";
    isPublic?: boolean;
    requiresApproval?: boolean;

    // Step 2
    eventType: string;
    price: string;
    ticketLink: string;
    numberOfAttendees: string;
    fastTrack: boolean;
    allowSponsorship: boolean;

    // Step 3 (RSVP Scheduling)
    rsvpStartDateTime?: Date | null;
    rsvpEndDateTime?: Date | null;
    customInviteMessage?: string;
    automatedReminders?: AutomatedReminder[];
    enableRsvp?: boolean; 

    // Step 4 (Activities)
    activityTiming?: "pre-event" | "during-event" | "both" | null;
    activities?: {
        preEvent?: {
            games?: EventGamificationData | null;
            vibetag?: null;
        };
        duringEvent?: {
            games?: EventGamificationData | null;
            vibetag?: null;
        };
    } | null;

    // Legacy gamification fields (to be deprecated)
    gamification?: {
        pre_event?: EventGamificationData | null;
        main_event?: EventGamificationData | null;
    } | null;
    gamificationMode?: EVENTGAMIFICATION_MODE | null;
    triviaData?: { question: string; options: string[]; correctOption: string }[];
    wordPuzzleData?: any;

    // Step 5
    noOfRecipients: string;
    rewards: { position: number; prizeType: string; prize: string }[];
    gameDuration: string;

    // Game Pricing
    gamePricing?: {
        basePrice: number;
        perRoundPrice: number;
        currency: string;
    };
};

interface EventFormState {
    step: number;
    data: FormValues;
    editMode: boolean;
}

// ── Initial state ──────────────────────────────────────────────────────────────
const initialFormValues: FormValues = {
    flier: null,
    promotionalVideo: null,
    backdrop: null,
    name: "",
    description: "",
    category: "",
    location: "",
    promoteEvent: false,
    isMultiDay: false,
    startDateTime: "",
    endDateTime: "",
    coordinates: { lon: 0, lat: 0 },
    tags: [],
    eventType: "trivia",
    price: "0",
    ticketLink: "",
    numberOfAttendees: "",
    fastTrack: false,
    allowSponsorship: true,
    rsvpStartDateTime: null,
    rsvpEndDateTime: null,
    customInviteMessage: "",
    automatedReminders: [],
    activityTiming: null,
    activities: null,
    gamification: null,
    gamificationMode: null,
    triviaData: [],
    wordPuzzleData: null,
    noOfRecipients: "",
    rewards: [],
    gameDuration: "",
    eventMode: "onsite",
    isPublic: true,
    requiresApproval: false,
};

const initialState: EventFormState = {
    step: 1,
    data: initialFormValues,
    editMode: false,
};

// ── Slice ──────────────────────────────────────────────────────────────────────
const eventFormSlice = createSlice({
    name: "eventForm",
    initialState,
    reducers: {
        setStep(state, action: PayloadAction<number>) {
            state.step = action.payload;
        },

        nextStep(state) {
            state.step += 1;
        },

        prevStep(state) {
            state.step -= 1;
        },

        updateData(state, action: PayloadAction<Partial<FormValues>>) {
            const newData = action.payload;

            // Mirror the logging from the original Zustand store
            if (newData.activities) {
                console.log("eventFormSlice - Updating activities:", newData.activities);
                console.log("eventFormSlice - Pre-event games:", newData.activities.preEvent?.games);
                console.log("eventFormSlice - During-event games:", newData.activities.duringEvent?.games);
            }

            state.data = { ...state.data, ...newData };
        },

        updateEditMode(state, action: PayloadAction<boolean>) {
            state.editMode = action.payload;
        },

        resetForm(state) {
            state.step = 1;
            state.data = initialFormValues;
            state.editMode = false;
        },
    },
});

export const {
    setStep,
    nextStep,
    prevStep,
    updateData,
    updateEditMode,
    resetForm,
} = eventFormSlice.actions;

export default eventFormSlice.reducer;


export const selectEventFormStep = (state: { eventForm: EventFormState }) =>
    state.eventForm.step;

export const selectEventFormData = (state: { eventForm: EventFormState }) =>
    state.eventForm.data;

export const selectEventFormEditMode = (state: { eventForm: EventFormState }) =>
    state.eventForm.editMode;