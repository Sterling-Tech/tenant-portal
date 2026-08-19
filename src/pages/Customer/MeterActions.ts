export const meterActions = [
    
    {
        id: "remove_meter",
        label: "Remove Meter",
        title: "Remove Meter Setup",
        fields: [
            {
                name: "reason",
                label: "Reason",
                placeholder: "Enter Reason",
            },
        ],
    },
    {
        id: "max_power",
        label: "Set Max Power",
        title: "Set Max Power Setup",
        fields: [
            {
                name: "max_power",
                label: "Select Kilos(KWh)",
                type: "select",
                options: [
                    { label: "0 KWh", value: "0" },
                    { label: "1 KWh", value: "1" },
                    { label: "2 KWh", value: "2" },
                    { label: "3 KWh", value: "3" }
                ]
            },
            {
                name: "reason",
                label: "Reason",
                type: "textarea"
            }
        ],
    },
    {
        id: "free_issue",
        label: "Free Issue",
        title: "Free Issue Setup",
        fields: [
            {
                name: "units",
                label: "Enter Unit(s)",
                type: "number",
                placeholder: "Enter Unit(s)"
            },
            {
                name: "reason",
                label: "Reason",
                type: "textarea",
                placeholder: "Reason"
            }
        ],
    },
    // Commented out per request — no endpoint wired up for this yet.
    // Restore this entry (and its <MenuItem> rendering, which just maps
    // over this array) if/when Vend is needed again.
    // {
    //     id: "vend",
    //     label: "Vend",
    //     title: "Vend Setup",
    //     fields: [
    //         {
    //             name: "amount",
    //             label: "Amount",
    //             placeholder: "Enter Amount",
    //         },
    //     ],
    // },
    {
        id: "clear_credit",
        label: "Clear Credit Token",
        title: "Clear Credit Token Setup",
        fields: [
            {
                name: "reason",
                label: "Reason",
                placeholder: "Enter Reason",
            },
        ],
    },
    {
        id: "tamper",
        label: "Tamper Token",
        title: "Tamper Token Setup",
        fields: [
            {
                name: "reason",
                label: "Reason",
                placeholder: "Enter Reason",
            },
        ],
    },
    {
        id: "key_change",
        label: "Key Change",
        title: "Key Change Setup",
        fields: [
            {
                name: "ststi",
                label: "STSTI",
                type: "text"
            },
            {
                name: "to_ststi",
                label: "To STSTI",
                type: "text"
            },
            {
                name: "krn",
                label: "KRN",
                type: "text"
            },
            {
                name: "to_krn",
                label: "To KRN",
                type: "text"
            },
            {
                name: "sgc",
                label: "SGC Code",
                type: "text"
            },
            {
                name: "to_sgc",
                label: "To SGC Code",
                type: "text"
            },
            {
                name: "reason",
                label: "Reason",
                type: "textarea"
            },
            {
                name: "keychange_type",
                label: "Keychange Type",
                type: "select",
                options: [
                    { label: "TI", value: "TI" },
                    { label: "KRN", value: "KRN" }
                ]
            }
        ],
    },
];