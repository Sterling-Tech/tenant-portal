import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogTitle,

  FormControlLabel,

  Stack,

  Switch,

  TextField,

} from "@mui/material";

import {

  useEffect,

  useState,

} from "react";

import {

  Substation,

  SubstationPayload,

} from "../../services/crmdService";


interface Props {

  open: boolean;

  onClose: () => void;

  substation:
    Substation | null;

  loading: boolean;

  onSubmit: (
    payload:
      SubstationPayload
  ) => void;

}


export default function
SubstationFormModal({

  open,

  onClose,

  substation,

  loading,

  onSubmit,

}: Props) {


  // =========================
  // FORM STATE
  // =========================

  const [

    form,

    setForm,

  ] = useState<SubstationPayload>({

    name: "",

    code: "",

    address: "",

    is_active: true,

  });


  // =========================
  // POPULATE FORM
  // =========================

  useEffect(() => {


    if (substation) {


      setForm({

        name:
          substation.name,

        code:
          substation.code,

        address:
          substation.address,

        is_active:
          substation.is_active,

      });


    } else {


      setForm({

        name: "",

        code: "",

        address: "",

        is_active: true,

      });


    }


  }, [

    substation,

    open,

  ]);


  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (

    field:
      keyof SubstationPayload,

    value:
      string | boolean

  ) => {


    setForm(

      (prev) => ({

        ...prev,

        [field]:
          value,

      })

    );

  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = () => {


    if (

      !form.name.trim()

    ) {

      return;

    }


    if (

      !form.code.trim()

    ) {

      return;

    }


    if (

      !form.address.trim()

    ) {

      return;

    }


    onSubmit({

      name:
        form.name.trim(),

      code:
        form.code.trim(),

      address:
        form.address.trim(),

      is_active:
        form.is_active,

    });

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


      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}

      <DialogTitle>


        {

          substation

            ? "Edit Substation"

            : "Add Substation"

        }


      </DialogTitle>


      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      <DialogContent>


        <Stack

          spacing={2}

          mt={1}

        >


          {/* NAME */}

          <TextField

            label="Substation Name"

            placeholder="
              Enter substation name
            "

            fullWidth


            value={
              form.name
            }


            onChange={(e) =>

              handleChange(

                "name",

                e.target.value

              )

            }

          />


          {/* CODE */}

          <TextField

            label="Substation Code"

            placeholder="
              Enter substation code
            "

            fullWidth


            value={
              form.code
            }


            onChange={(e) =>

              handleChange(

                "code",

                e.target.value

              )

            }

          />


          {/* ADDRESS */}

          <TextField

            label="Address"

            placeholder="
              Enter substation address
            "

            fullWidth

            multiline

            rows={3}


            value={
              form.address
            }


            onChange={(e) =>

              handleChange(

                "address",

                e.target.value

              )

            }

          />


          {/* STATUS */}

          <FormControlLabel

            control={

              <Switch

                checked={
                  form.is_active
                }


                onChange={(e) =>

                  handleChange(

                    "is_active",

                    e.target.checked

                  )

                }

              />

            }


            label={

              form.is_active

                ? "Active"

                : "Inactive"

            }

          />


        </Stack>


      </DialogContent>


      {/* ========================= */}
      {/* ACTIONS */}
      {/* ========================= */}

      <DialogActions>


        <Button

          onClick={onClose}

          disabled={loading}

        >

          Cancel

        </Button>


        <Button

          variant="contained"

          onClick={
            handleSubmit
          }

          disabled={loading}

        >


          {

            loading

              ? "Saving..."

              : substation

                ? "Update Substation"

                : "Create Substation"

          }


        </Button>


      </DialogActions>


    </Dialog>

  );

}