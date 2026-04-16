import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 * Prevents entire app from crashing due to component errors
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });

        // Log to error tracking service (e.g., Sentry)
        if (window.Sentry) {
            window.Sentry.captureException(error);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                }}>
                    <div style={{
                        maxWidth: '600px',
                        padding: '40px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '20px',
                        }}>
                            ⚠️
                        </div>

                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '10px',
                            color: '#1f2937',
                        }}>
                            Oops! Something went wrong
                        </h1>

                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            marginBottom: '20px',
                            lineHeight: '1.6',
                        }}>
                            We encountered an unexpected error. Don't worry, our team has been notified.
                            Try refreshing the page or going back to home.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details style={{
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                textAlign: 'left',
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                                    Error Details (Dev Only)
                                </summary>
                                <pre style={{
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    color: '#fecaca',
                                    backgroundColor: '#1f2937',
                                    padding: '10px',
                                    borderRadius: '4px',
                                }}>
                                    {this.state.error?.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                }}
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#e5e7eb',
                                    color: '#1f2937',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                }}
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
