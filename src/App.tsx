import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { VendorProvider } from './contexts/VendorContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Auth/Login';
import TenantAdmin from './pages/Tenants/Admin/TenantAdmin';
import Settings from './pages/Settings/Settings';
import VendorManagement from './pages/Vendors/VendorManagement';
import VendorHierarchy from './pages/Vendors/VendorHierarchy';
import WalletManagement from './pages/Vendors/WalletManagement';
import Layout from './components/Layout/Layout';
import CustomerManagement from './pages/Customer/Customer';
import VendorTransactions from './pages/Vendors/VendorTransactions';
import CustomerAdmin from './pages/Customer/Dashboard';
import Subaccount from './pages/Customer/Subaccount';
import CustomerTrans from './pages/Customer/CustomerTrans';

// Enhanced theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#0047ab',
            light: '#4f7fd1',
            dark: '#003586',
        },
        secondary: {
            main: '#ff6f61',
            light: '#ffa296',
            dark: '#c43f31',
        },
        background: {
            default: '#f2f5fa',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 12px 30px rgba(15, 51, 107, 0.08)',
                    border: '1px solid rgba(15, 51, 107, 0.08)',
                    background:
                        'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(244,247,252,0.92) 100%)',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background:
                        'linear-gradient(180deg, rgba(238,244,252,1) 0%, rgba(247,250,255,1) 40%, rgba(255,255,255,1) 100%)',
                    minHeight: '100vh',
                },
            },
        },
    },
});

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <VendorProvider>
                    <Router
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true,
                        }}
                        basename={process.env.PUBLIC_URL || ''}
                    >
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/tenants/admin"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <TenantAdmin />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customer/admin"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <CustomerAdmin />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customer/subaccount"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Subaccount />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Settings />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vendors"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <VendorManagement />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customer"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <CustomerManagement/>
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/customer/transaction"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <CustomerTrans/>
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vendors/hierarchy"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <VendorHierarchy />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vendors/transactions"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <VendorTransactions />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vendors/wallets"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <WalletManagement />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/" element={<Navigate to="/tenants/admin" replace />} />
                            <Route path="/dashboard" element={<Navigate to="/tenants/admin" replace />} />
                            <Route path="/tenants/dashboard" element={<Navigate to="/tenants/admin" replace />} />
                            {/* Catch-all route for unmatched paths */}
                            <Route path="*" element={<Navigate to="/tenants/admin" replace />} />
                        </Routes>
                    </Router>
                </VendorProvider>
            </ThemeProvider>
        </Provider>
    );
};

export default App;

