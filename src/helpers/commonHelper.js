export function formatDuration(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let result = '';
    if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        result += (hours > 0 ? ' ' : '') + `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return result || '0 minutes';
}
export function isStudentLoggedIn(){
    if (typeof window !== 'undefined') {
        const rolename = localStorage.getItem('rolename') || '';
        return rolename === 'STUDENT';
    }
    return false;
}