
import React from "react";

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends React.Component<
    React.PropsWithChildren,
    State
> {
    constructor(props: React.PropsWithChildren) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Application crashed:", error, info);

        // Optional:
        // Send error to Sentry
        // Send to backend
        // LogRocket.captureException(error)
    }

    render() {
    if (this.state.hasError) {
        return (
            <div
                style={{
                    padding:40,
                    textAlign:"center"
                }}
            >
                <h2>Something went wrong.</h2>

                <pre
                    style={{
                        color:"red",
                        whiteSpace:"pre-wrap"
                    }}
                >
                    {/* {String(this.state.error)} */}
                    {JSON.stringify(this.state.error,null,2)}
                </pre>

                <button
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Refresh
                </button>
            </div>
        );
    }

    return this.props.children;
}
}