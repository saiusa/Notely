import React from 'react';
import '../../../sass/components/layout/AuthLayout.scss';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-layout">
            <div className="auth-layout__card">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <img 
                        src="/images/Notely-Logo.svg" 
                        alt="Notely" 
                        style={{ height: '3rem', width: 'auto', objectFit: 'contain' }} 
                    />
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
