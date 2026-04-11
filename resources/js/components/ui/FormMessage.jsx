import React from 'react';
import '../../sass/components/ui/FormMessage.scss';

export default function FormMessage({ tone = 'neutral', children }) {
    return (
        <div className={`form-message__container form-message__container--${tone}`}>
            {children}
        </div>
    );
}
