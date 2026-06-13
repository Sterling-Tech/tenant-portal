// import React from "react";
// import { Box, Typography } from "@mui/material";
// import { VendorFormData } from "./WizardTypes";

// interface StepParentProps {
//   data: VendorFormData;
//   onChange: (field: keyof VendorFormData, value: string) => void;
//   // For subvendors/agents/etc the parent is selectable; for vendors it's fixed
//   fixed?: boolean;
//   parentLabel?: string;      // e.g. "Tenant", "Vendor"
//   entityLabel?: string;      // e.g. "New vendor", "New subvendor"
//   description?: string;
//   parentOptions?: string[];  // selectable options when not fixed
// }

// export default function StepParent({
//   data,
//   onChange,
//   fixed = true,
//   parentLabel = "Tenant",
//   entityLabel = "New vendor",
//   description,
//   parentOptions = [],
// }: StepParentProps) {
//   const desc =
//     description ||
//     "Vendors (e.g. BAXI, Moneypoint, OPay) sit directly under this Disco tenant. All subvendors, agents, cashiers and POS must be created under a vendor.";

//   return (
//     <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
//       {/* Hierarchy card */}
//       <Box
//         sx={{
//           border: "1px solid #D6E0F5",
//           borderRadius: 2,
//           bgcolor: "#F0F4FB",
//           p: 2.5,
//         }}
//       >
//         <Typography
//           sx={{
//             fontSize: "0.7rem",
//             fontWeight: 800,
//             letterSpacing: "0.1em",
//             color: "#0F2D6B",
//             mb: 1.5,
//           }}
//         >
//           PARENT — {parentLabel.toUpperCase()}{fixed ? " (FIXED)" : ""}
//         </Typography>

//         {fixed ? (
//           /* Fixed parent — pill breadcrumb */
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Box
//               sx={{
//                 px: 1.8,
//                 py: 0.6,
//                 borderRadius: 20,
//                 border: "1.5px solid #B0BFD8",
//                 bgcolor: "#fff",
//                 fontSize: "0.85rem",
//                 fontWeight: 600,
//                 color: "#0F2D6B",
//               }}
//             >
//               {parentLabel}
//             </Box>
//             <Typography sx={{ color: "#9AA4B2", fontSize: "1rem" }}>›</Typography>
//             <Box
//               sx={{
//                 px: 1.8,
//                 py: 0.6,
//                 borderRadius: 20,
//                 border: "1.5px dashed #B0BFD8",
//                 bgcolor: "#EEF2FB",
//                 fontSize: "0.85rem",
//                 fontWeight: 500,
//                 color: "#6B7A8D",
//               }}
//             >
//               {entityLabel}
//             </Box>
//           </Box>
//         ) : (
//           /* Selectable parent */
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
//               Select which {parentLabel.toLowerCase()} this entity will belong to:
//             </Typography>
//             <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//               {parentOptions.map((opt) => (
//                 <Box
//                   key={opt}
//                   onClick={() => onChange("parent", opt)}
//                   sx={{
//                     px: 1.8,
//                     py: 0.6,
//                     borderRadius: 20,
//                     border: "1.5px solid",
//                     borderColor: data.parent === opt ? "#0F2D6B" : "#B0BFD8",
//                     bgcolor: data.parent === opt ? "#0F2D6B" : "#fff",
//                     color: data.parent === opt ? "#fff" : "#0F2D6B",
//                     fontSize: "0.85rem",
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     transition: "all 0.15s",
//                     "&:hover": {
//                       borderColor: "#0F2D6B",
//                       bgcolor: data.parent === opt ? "#0F2D6B" : "#EEF2FB",
//                     },
//                   }}
//                 >
//                   {opt}
//                 </Box>
//               ))}
//             </Box>
//             {/* breadcrumb preview */}
//             {data.parent && (
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
//                 <Box sx={{ px: 1.5, py: 0.4, borderRadius: 20, border: "1.5px solid #B0BFD8", bgcolor: "#fff", fontSize: "0.8rem", fontWeight: 600, color: "#0F2D6B" }}>
//                   {data.parent}
//                 </Box>
//                 <Typography sx={{ color: "#9AA4B2" }}>›</Typography>
//                 <Box sx={{ px: 1.5, py: 0.4, borderRadius: 20, border: "1.5px dashed #B0BFD8", bgcolor: "#EEF2FB", fontSize: "0.8rem", color: "#6B7A8D" }}>
//                   {entityLabel}
//                 </Box>
//               </Box>
//             )}
//           </Box>
//         )}
//       </Box>

//       {/* Description */}
//       <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
//         {desc}
//       </Typography>
//     </Box>
//   );
// }
import React from 'react'

export default function StepParent() {
  return (
    <div>StepParent</div>
  )
}
