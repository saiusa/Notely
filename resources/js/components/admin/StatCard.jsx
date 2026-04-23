/**
 * components/admin/StatCard.jsx
 * Individual stat card displaying a single metric.
 * Displays: label, value, icon, and optional trend/subtitle
 */
import React from 'react';
import '../../../sass/components/admin/StatCard.scss';

export default function StatCard({
    label = 'Metric',
    value = '0',
    icon = 'info',
    subtitle = null,
    variant = 'default', // 'default', 'success', 'warning', 'danger'
}) {
    return (
        <div className={`stat-card stat-card--${variant}`}>
            <div className="stat-card__header">
                <h3 className="stat-card__label">{label}</h3>
                <span className={`material-symbols-outlined stat-card__icon stat-card__icon--${variant}`}>
                    {icon}
                </span>
            </div>

            <div className="stat-card__body">
                <p className="stat-card__value">{value}</p>
                {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
            </div>
        </div>
    );
}
