export function getTodayISO(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

export function getCurrentDayOfWeek(): number {
    return new Date().getDay();
}

export function getDateRangeForLastNDays(n: number): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - n + 1);

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
}

export function formatDateForDisplay(isoDate: string): string {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
    });
}

export function formatFullDate(date: Date = new Date()): string {
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export const DAYS_OF_WEEK = [
    { id: 0, short: 'Dom', long: 'Domingo' },
    { id: 1, short: 'Lun', long: 'Lunes' },
    { id: 2, short: 'Mar', long: 'Martes' },
    { id: 3, short: 'Mie', long: 'Miércoles' },
    { id: 4, short: 'Jue', long: 'Jueves' },
    { id: 5, short: 'Vie', long: 'Viernes' },
    { id: 6, short: 'Sab', long: 'Sábado' },
];

export function getDayName(dayId: number, short: boolean = true): string {
    const day = DAYS_OF_WEEK.find(d => d.id === dayId);
    return day ? (short ? day.short : day.long) : '';
}

export function formatFrequencyDisplay(frequency: number[]): string {
    if (frequency.length === 7) return 'Todos los días';
    if (frequency.length === 0) return 'Sin días';

    const weekdays = [1, 2, 3, 4, 5];
    const weekend = [0, 6];

    if (JSON.stringify(frequency.sort()) === JSON.stringify(weekdays)) {
        return 'Entre semana';
    }
    if (JSON.stringify(frequency.sort()) === JSON.stringify(weekend)) {
        return 'Fines de semana';
    }

    return frequency.map(d => getDayName(d)).join(', ');
}
