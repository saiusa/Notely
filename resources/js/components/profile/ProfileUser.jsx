import React from 'react';
import { countryOptions } from './countries';
import '../../../sass/components/profile/ProfileUser.scss';

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

export { countryOptions };



