/**
 * Calculates current age dynamically based on Date of Birth.
 * 
 * @param {string} dateOfBirth - ISO date string of Pet's DOB
 * @returns {string} Formatted display string, e.g., "3 Months Old"
 */
export const calculateDynamicAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Age Unknown';

    const dob = new Date(dateOfBirth);
    const now = new Date();

    if (isNaN(dob.getTime())) return 'Age Unknown';

    const totalMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());

    if (totalMonths < 12) {
        if (totalMonths <= 0) return 'Newborn';
        return `${totalMonths} Month${totalMonths !== 1 ? 's' : ''} Old`;
    } else {
        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;

        let result = `${years} Year${years !== 1 ? 's' : ''}`;
        if (remainingMonths > 0) {
            result += ` ${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''}`;
        }
        return `${result} Old`;
    }
};

/**
 * Calculates an approximate Date of Birth from a given age value and unit.
 */
export const calculateDobFromAge = (ageValue, ageUnit) => {
    if (!ageValue) return '';
    const val = parseInt(ageValue, 10);
    if (isNaN(val)) return '';

    const now = new Date();
    if (ageUnit === 'years') {
        now.setFullYear(now.getFullYear() - val);
    } else {
        now.setMonth(now.getMonth() - val);
    }
    return now.toISOString().split('T')[0];
};
