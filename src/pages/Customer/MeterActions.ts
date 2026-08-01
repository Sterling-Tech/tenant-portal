export const meterActions = [
    // {
    //     id: "change_sgc",
    //     label: "Change SGC Code",
    //     title: "Change SGC Code Setup",
    //     fields: [
    //         {
    //             name: "sgc_code",
    //             label: "SGC Code",
    //             placeholder: "Enter SGC Code",
    //         },
    //     ],
    // },
    // Commented out per request — no endpoint wired up for this yet.
    // Restore this entry (and its <MenuItem> rendering, which just maps
    // over this array) if/when Change Tariff Index is needed again.
    // {
    //     id: "change_tariff",
    //     label: "Change Tariff Index",
    //     title: "Change Tariff Index Setup",
    //     fields: [
    //         {
    //             name: "tariff",
    //             label: "Change Tariff Index",
    //             type: "select",
    //             options: [
    //                 { label: "C2", value: "C2" },
    //                 { label: "R1", value: "R1" },
    //                 { label: "R3", value: "R3" },
    //                 { label: "R4", value: "R4" },
    //                 { label: "C3", value: "C3" },
    //                 { label: "D1S", value: "D1S" },
    //                 { label: "D1T", value: "D1T" },
    //                 { label: "D2", value: "D2" },
    //                 { label: "D3", value: "D3" },
    //                 { label: "A1S", value: "A1S" },
    //                 { label: "A3", value: "A3" },
    //                 { label: "S1", value: "S1" },
    //                 { label: "A1T", value: "A1T" },
    //                 { label: "A2T", value: "A2T" },
    //                 { label: "C1T", value: "C1T" },
    //                 { label: "A2", value: "A2" },
    //                 { label: "R2S", value: "R2S" },
    //                 { label: "C1S", value: "C1S" },
    //                 { label: "R2", value: "R2" },
    //                 { label: "A1", value: "A1" },
    //                 { label: "C1", value: "C1" },
    //                 { label: "D1", value: "D1" },
    //                 { label: "R3T", value: "R3T" },
    //             ]
    //         },
    //         {
    //             name: "life_notes",
    //             label: "Life Notes",
    //             type: "textarea"
    //         }
    //     ]
    // },
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