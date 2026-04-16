import React from 'react';
import '../../../sass/components/profile/ProfileShared.scss';

export const countryOptions = [
    { value: 'south-korea', label: 'Seoul, South Korea' },
    { value: 'japan', label: 'Tokyo, Japan' },
    { value: 'united-states', label: 'Los Angeles, United States' },
    { value: 'canada', label: 'Toronto, Canada' },
];

export function formatBirthday(dateString) {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export function getCountryLabel(countryValue) {
    const country = countryOptions.find((item) => item.value === countryValue);
    return country?.label || countryOptions[0].label;
}



