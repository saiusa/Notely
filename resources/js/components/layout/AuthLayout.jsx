import React from 'react';
import '../../../sass/components/layout/AuthLayout.scss';

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="auth-layout__container">
            <div className="auth-layout__wrapper">
                <section className="auth-layout__section">
                    <div className="auth-layout__header">
                        <h1 className="auth-layout__logo">
                            Notely
                        </h1>
                    </div>

                    <div className="auth-layout__content">
                        {title ? <h2 className="auth-layout__title">{title}</h2> : null}
                        {subtitle ? <p className="auth-layout__subtitle">{subtitle}</p> : null}
                        <div className="auth-layout__form-wrapper">{children}</div>
                    </div>
                </section>
            </div>
        </div>
    );
}
