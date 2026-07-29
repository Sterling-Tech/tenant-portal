import React, { useEffect, useState } from 'react'

import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SchemeLists from './SchemeLists';
import CreateSchemeModal from './CreateSchemeModal';
import { createScheme, CreateSchemePayload, retrieveSchemes, retrieveSuppliers, Ringfences, Supplier } from '../../services/ringfenceService';
import { toast } from "react-toastify";
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function RingfenceDashboard() {
    const [open, setOpen] = useState(false);
    const [schemes, setSchemes] = useState<Ringfences[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const [schemeRes, supplierRes] = await Promise.all([
                retrieveSchemes(),
                retrieveSuppliers(),
            ]);

            setSchemes(schemeRes.results);
            setSuppliers(supplierRes.results);

        } catch(err){
            console.log(err)
            getErrorMessage(err)
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const summary = {
        totalSchemes: schemes.length,

        activeSchemes: schemes.filter(
            s => s.is_active
        ).length,

        totalSuppliers: suppliers.length,

        customersAssigned: schemes.reduce(
            (sum, s) => sum + s.customer_count,
            0
        ),

        vendorsAssigned: schemes.reduce(
            (sum, s) => sum + s.vendor_count,
            0
        ),
    };

    const cards = [
        {
            title: "Total Schemes",
            value: summary.totalSchemes,
        },
        {
            title: "Active Schemes",
            value: summary.activeSchemes,
        },
        {
            title: "Total Suppliers",
            value: summary.totalSuppliers,
        },
        {
            title: "Customers Assigned",
            value: summary.customersAssigned.toLocaleString(),
        },
        {
            title: "Vendors Assigned",
            value: summary.vendorsAssigned.toLocaleString(),
        },
    ];

    const handleCreateScheme = async (values: CreateSchemePayload) => {
        try {
            setLoading(true);

            await createScheme(values);

            toast.success("Scheme created successfully");

            setOpen(false);

            loadDashboard(); // refresh summary

        } catch (err: any) {
            toast.error(getErrorMessage(err || err.message || "unable to generate scheme"));
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box>

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Ring Fence Management
                    </Typography>

                    <Typography color="text.secondary">
                        Manage schemes, suppliers and assignments.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    New Scheme
                </Button>

            </Stack>

            <Grid container spacing={3} mb={4}>
                {cards.map((card) => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={2.4}
                        key={card.title}
                    >
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: 1,
                                height: "100%",
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {card.title}
                                </Typography>

                                <Typography
                                    mt={1}
                                    variant="h4"
                                    fontWeight={700}
                                >
                                    {card.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Next section */}

            <Typography variant="h6" fontWeight={700}>
                Schemes
            </Typography>

            <Typography color="text.secondary">
                Scheme list and details will appear here.
            </Typography>

            <Box mt={4}>
                <SchemeLists />
            </Box>

            <CreateSchemeModal
                open={open}
                onClose={() => setOpen(false)}
                suppliers={suppliers}
                loading={loading}
                onSubmit={handleCreateScheme}
            />

        </Box>
    );
}
