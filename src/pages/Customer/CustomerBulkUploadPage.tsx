import React from 'react'
import CustomerBulkUpload from './CustomerBulkUpload';
import { toast } from 'react-toastify';

export default function CustomerBulkUploadPage() {
    return (
        <div>

            <CustomerBulkUpload
                kind="customers"
                onImportComplete={() => {
                    // load();
                    toast.success("Customer import completed successfully!");
                }}
            />
            <div style={{ marginTop: "20px" }}>
                <CustomerBulkUpload 
                    kind="debts" 
                    onImportComplete={() => {
                        // load();
                        toast.success("Debt import completed successfully!");
                    }}
                />
            </div>
        </div>
    )
}
