// import { useEffect, useState } from "react";

// import {
//   Alert,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";

// import { Tariff } from "../../../services/crmdService";

// interface Props {
//   open: boolean;

//   onClose: () => void;

//   tariff: Tariff | null;

//   loading: boolean;

//   onSubmit: (effectiveTo: string) => void;
// }

// export default function CloseTariffDialog({
//   open,
//   onClose,
//   tariff,
//   loading,
//   onSubmit,
// }: Props) {
//   const [effectiveTo, setEffectiveTo] = useState("");

//   useEffect(() => {
//     if (open) {
//       const now = new Date();

//       const formattedDate = now
//         .toISOString()
//         .slice(0, 16);

//       setEffectiveTo(formattedDate);
//     }
//   }, [open]);

//   const handleSubmit = () => {
//     if (!effectiveTo) {
//       return;
//     }

//     const isoDate = new Date(
//       effectiveTo
//     ).toISOString();

//     onSubmit(isoDate);
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={loading ? undefined : onClose}
//       fullWidth
//       maxWidth="sm"
//     >
//       <DialogTitle>
//         Close Tariff Window
//       </DialogTitle>

//       <DialogContent>
//         <Stack spacing={2} mt={1}>
//           <Alert severity="warning">
//             Closing this tariff will end its current
//             effective window. A replacement tariff can
//             then be created.
//           </Alert>

//           {tariff && (
//             <Stack spacing={1}>
//               <Typography>
//                 <strong>Tariff:</strong>{" "}
//                 {tariff.name}
//               </Typography>

//               <Typography>
//                 <strong>Band:</strong>{" "}
//                 {tariff.band?.name}
//               </Typography>

//               <Typography>
//                 <strong>Category:</strong>{" "}
//                 {tariff.category?.name}
//               </Typography>

//               <Typography>
//                 <strong>Rate:</strong>{" "}
//                 {tariff.rate}
//               </Typography>

//               <Typography>
//                 <strong>Effective From:</strong>{" "}
//                 {new Date(
//                   tariff.effective_from
//                 ).toLocaleString()}
//               </Typography>
//             </Stack>
//           )}

//           <TextField
//             fullWidth
//             label="Effective To"
//             type="datetime-local"
//             value={effectiveTo}
//             onChange={(e) =>
//               setEffectiveTo(e.target.value)
//             }
//             InputLabelProps={{
//               shrink: true,
//             }}
//           />
//         </Stack>
//       </DialogContent>

//       <DialogActions>
//         <Button
//           disabled={loading}
//           onClick={onClose}
//         >
//           Cancel
//         </Button>

//         <Button
//           variant="contained"
//           color="warning"
//           disabled={loading || !effectiveTo}
//           onClick={handleSubmit}
//         >
//           {loading
//             ? "Closing..."
//             : "Close Tariff"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

import {
  useEffect,
  useState,
} from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

import { Tariff } from "../../../services/crmdService";


interface Props {

  open: boolean;

  tariff: Tariff | null;

  loading: boolean;

  onClose: () => void;

  onConfirm: (
    effectiveTo: string
  ) => void;

}


export default function CloseTariffDialog({

  open,

  tariff,

  loading,

  onClose,

  onConfirm,

}: Props) {


  const [

    effectiveTo,

    setEffectiveTo,

  ] = useState("");


  // =========================
  // SET DEFAULT DATE
  // =========================

  useEffect(() => {


    if (open) {


      const now = new Date();


      const year =
        now.getFullYear();


      const month =
        String(
          now.getMonth() + 1
        ).padStart(2, "0");


      const day =
        String(
          now.getDate()
        ).padStart(2, "0");


      const hours =
        String(
          now.getHours()
        ).padStart(2, "0");


      const minutes =
        String(
          now.getMinutes()
        ).padStart(2, "0");


      setEffectiveTo(

        `${year}-${month}-${day}T${hours}:${minutes}`

      );


    }


  }, [open]);


  // =========================
  // CONFIRM
  // =========================

  const handleConfirm = () => {


    if (!effectiveTo) {


      alert(
        "Please select an effective end date"
      );


      return;

    }


    const isoDate =

      new Date(
        effectiveTo
      ).toISOString();


    onConfirm(
      isoDate
    );


  };


  return (

    <Dialog

      open={open}

      onClose={
        loading
          ? undefined
          : onClose
      }

      fullWidth

      maxWidth="sm"

    >


      <DialogTitle>

        Close Tariff Window

      </DialogTitle>


      <DialogContent>


        <DialogContentText
          sx={{
            mb: 3,
          }}
        >

          You are about to close the tariff:

          <br />

          <strong>

            {tariff?.name}

          </strong>

        </DialogContentText>


        <TextField

          fullWidth

          type="datetime-local"

          label="Effective To"

          value={effectiveTo}

          InputLabelProps={{
            shrink: true,
          }}

          onChange={(event) =>

            setEffectiveTo(
              event.target.value
            )

          }

        />


      </DialogContent>


      <DialogActions>


        <Button

          disabled={loading}

          onClick={onClose}

        >

          Cancel

        </Button>


        <Button

          variant="contained"

          color="warning"

          disabled={loading}

          onClick={handleConfirm}

        >

          {

            loading

              ? "Closing..."

              : "Close Tariff"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}