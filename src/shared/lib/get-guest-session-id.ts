/* eslint-disable @typescript-eslint/no-unused-expressions */
export const getGuestSessionId = () => {
    if (typeof window === "undefined") return null;

    let sessionId = typeof window !== "undefined" && localStorage.getItem("guest_session_id");

    if (!sessionId) {
        sessionId = crypto.randomUUID();

        typeof window !== "undefined" && localStorage.setItem("guest_session_id", sessionId);
    }

    return sessionId;
};