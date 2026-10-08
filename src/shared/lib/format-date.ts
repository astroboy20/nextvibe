export function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        year: 'numeric',
        month: 'long',
    };

    return new Date(dateString).toLocaleDateString("en-US", options);
}

export function formatTime(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    return new Date(dateString).toLocaleTimeString("en-US", options);
}