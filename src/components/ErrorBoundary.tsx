import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            py: 4
                        }}
                    >
                        <Typography variant="h4" component="h1" gutterBottom>
                            Något gick fel
                        </Typography>
                        <Typography color="text.secondary" align="center">
                            Ett oväntat fel inträffade. Vi ber om ursäkt för besväret.
                        </Typography>
                        {this.state.error && (
                            <Typography color="error" variant="body2">
                                {this.state.error.message}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                        >
                            Ladda om sidan
                        </Button>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}
