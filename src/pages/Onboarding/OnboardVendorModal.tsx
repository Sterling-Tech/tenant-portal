import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { OnboardVendorPayload } from "../../services/onbordingService";


// export interface OnboardVendorForm {
//   email: string;
//   password: string;
// }

interface OnboardVendorModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  form: OnboardVendorPayload;
  setForm: React.Dispatch<React.SetStateAction<OnboardVendorPayload>>;
  onSubmit: () => void;
}

export default function OnboardVendorModal({
  open,
  onClose,
  loading = false,
  form,
  setForm,
  onSubmit,
}: OnboardVendorModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="bg-blue-950 text-white">
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Add Vendor
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Vendor Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />

          <TextField
            label="Temporary Password"
            type="password"
            fullWidth
            required
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
          />
          <TextField
            label="Business Name"
            fullWidth
            required
            value={form.business_name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                business_name: e.target.value,
              }))
            }
          />

          <Alert severity="info">
            The vendor will receive these credentials and complete the remaining
            onboarding process after logging into the Vendor Portal.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
            onClick={onClose}
        >
          Cancel
        </Button>

        <Button
        //   loading={loading}
          variant="contained"
          onClick={onSubmit}
        >
          Create Vendor
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// import React from "react";
// import {
//   Alert,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";

// import {
//   OnboardVendorPayload,
//   VendorHierarchy,
//   RelatedVendorProp,
// } from "../../services/onbordingService";

// interface OnboardVendorModalProps {
//   open: boolean;
//   onClose: () => void;
//   loading?: boolean;

//   hierarchy: VendorHierarchy;

//   form: OnboardVendorPayload;

//   setForm: React.Dispatch<
//     React.SetStateAction<OnboardVendorPayload>
//   >;

 
//   parentOptions: RelatedVendorProp[];

//   onSubmit: () => void;
// }

// export default function OnboardVendorModal({
//   open,
//   onClose,
//   loading = false,
//   hierarchy,
//   form,
//   setForm,
//   parentOptions,
//   onSubmit,
// }: OnboardVendorModalProps) {
 
//   const hierarchyLabel: Record<VendorHierarchy, string> = {
//     vendor: "Vendor",
//     sub_vendor: "Sub-vendor",
//     agent: "Agent",
//     cashier: "Cashier",
//     pos: "POS",
//   };

  
//   const requiresParent = hierarchy !== "vendor";

  
//   const parentLabel: Record<
//     Exclude<VendorHierarchy, "vendor">,
//     string
//   > = {
//     sub_vendor: "Parent Vendor",
//     agent: "Parent Sub-vendor",
//     cashier: "Parent Agent",
//     pos: "Parent Agent",
//   };

//   const currentLabel = hierarchyLabel[hierarchy];

//   return (
//     <Dialog
//       open={open}
//       onClose={loading ? undefined : onClose}
//       fullWidth
//       maxWidth="sm"
//     >
//       <DialogTitle className="bg-blue-950 text-white">
//         <Typography
//           variant="h6"
//           fontWeight={700}
//         >
//           Add {currentLabel}
//         </Typography>
//       </DialogTitle>

//       <DialogContent>
//         <Stack spacing={3} mt={1}>

          
//           <Alert severity="info">
//             You are creating a{" "}
//             <strong>{currentLabel}</strong>.
//           </Alert>

          
//           {requiresParent && (
//             <FormControl fullWidth required>
//               <InputLabel>
//                 {parentLabel[
//                   hierarchy as Exclude<VendorHierarchy, "vendor">
//                 ]}
//               </InputLabel>

//               <Select
//                 value={form.related_vendor ?? ""}
//                 label={
//                   parentLabel[
//                     hierarchy as Exclude<
//                       VendorHierarchy,
//                       "vendor"
//                     >
//                   ]
//                 }
//                 onChange={(e) => {
//                   setForm((prev) => ({
//                     ...prev,
//                     related_vendor: Number(e.target.value),
//                   }));
//                 }}
//               >
//                 {parentOptions.length === 0 ? (
//                   <MenuItem disabled>
//                     No available parent found
//                   </MenuItem>
//                 ) : (
//                   parentOptions.map((parent) => (
//                     <MenuItem
//                       key={parent.id}
//                       value={parent.id}
//                     >
//                       {parent.business_name}
//                       {" — "}
//                       {parent.email}
//                     </MenuItem>
//                   ))
//                 )}
//               </Select>
//             </FormControl>
//           )}

          
//           <TextField
//             label="Business Name"
//             fullWidth
//             required
//             value={form.business_name}
//             onChange={(e) =>
//               setForm((prev) => ({
//                 ...prev,
//                 business_name: e.target.value,
//               }))
//             }
//           />

          
//           <TextField
//             label={`${currentLabel} Email`}
//             type="email"
//             fullWidth
//             required
//             value={form.email}
//             onChange={(e) =>
//               setForm((prev) => ({
//                 ...prev,
//                 email: e.target.value,
//               }))
//             }
//           />

          
//           <TextField
//             label="Temporary Password"
//             type="password"
//             fullWidth
//             required
//             value={form.password}
//             onChange={(e) =>
//               setForm((prev) => ({
//                 ...prev,
//                 password: e.target.value,
//               }))
//             }
//           />

//           <Alert severity="info">
//             The {currentLabel.toLowerCase()} will receive
//             the login credentials and continue the
//             onboarding process from the portal.
//           </Alert>
//         </Stack>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, pb: 3 }}>
//         <Button
//           onClick={onClose}
//           disabled={loading}
//         >
//           Cancel
//         </Button>

//         <Button
//           variant="contained"
//           onClick={onSubmit}
//           disabled={loading}
//         >
//           {loading
//             ? "Creating..."
//             : `Create ${currentLabel}`}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }