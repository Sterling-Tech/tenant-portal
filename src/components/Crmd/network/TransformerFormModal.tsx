import {

  useEffect,

  useState,

} from "react";


import {

  Button,

  Dialog,

  DialogActions,

  DialogContent,

  DialogTitle,

  FormControlLabel,

  MenuItem,

  Stack,

  Switch,

  TextField,

} from "@mui/material";


import {

  Feeder,

  Transformer,

  TransformerPayload,

  getFeeders,

} from "../../../services/crmdService";


interface Props {


  open:
    boolean;


  onClose:
    () => void;


  transformer:
    Transformer | null;


  loading:
    boolean;


  onSubmit:

    (
      payload:
        TransformerPayload
    ) => void;


}


export default function TransformerFormModal({

  open,

  onClose,

  transformer,

  loading,

  onSubmit,

}: Props) {


  // =========================
  // FORM STATE
  // =========================

  const [

    form,

    setForm,

  ] = useState<
    TransformerPayload
  >({


    name: "",


    code: "",


    feeder: 0,


    schedule:
      "nlsh",


    status:
      "active",


    address: "",


    is_active:
      true,


  });


  // =========================
  // FEEDERS
  // =========================

  const [

    feeders,

    setFeeders,

  ] = useState<
    Feeder[]
  >([]);


  // =========================
  // LOAD FEEDERS
  // =========================

  useEffect(() => {


    if (!open)
      return;


    const loadFeeders =
      async () => {


        try {


          const response =

            await getFeeders(

              "",

              1,

              100

            );


          const results =

            Array.isArray(response)

              ? response

              : response?.results ?? [];


          setFeeders(
            results
          );


        } catch (error) {


          console.error(

            "Failed to load feeders",

            error

          );


        }


      };


    loadFeeders();


  }, [open]);


  // =========================
  // EDIT DATA
  // =========================

  useEffect(() => {


    if (transformer) {


      setForm({


        name:

          transformer.name,


        code:

          transformer.code,


        feeder:

          transformer.feeder
            ?.id ?? 0,


        schedule:

          transformer.schedule,


        status:

          transformer.status,


        address:

          transformer.address,


        is_active:

          transformer.is_active,


      });


    } else {


      setForm({


        name: "",


        code: "",


        feeder: 0,


        schedule:
          "nlsh",


        status:
          "active",


        address: "",


        is_active:
          true,


      });


    }


  }, [

    transformer,

    open,

  ]);


  // =========================
  // CHANGE HANDLER
  // =========================

  const handleChange = (

    field:
      keyof TransformerPayload,

    value:
      any

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


      alert(

        "Transformer name is required"

      );


      return;


    }


    if (

      !form.code.trim()

    ) {


      alert(

        "Transformer code is required"

      );


      return;


    }


    if (

      !form.feeder

    ) {


      alert(

        "Feeder is required"

      );


      return;


    }


    if (

      !form.address.trim()

    ) {


      alert(

        "Transformer address is required"

      );


      return;


    }


    onSubmit(
      form
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


      {/* ===================== */}
      {/* TITLE */}
      {/* ===================== */}

      <DialogTitle className='bg-blue-900' color='white'>


        {

          transformer

            ? "Edit Transformer"

            : "Add Transformer"

        }


      </DialogTitle>


      {/* ===================== */}
      {/* CONTENT */}
      {/* ===================== */}

      <DialogContent>


        <Stack

          spacing={2}

          mt={3}

        >


          {/* NAME */}

          <TextField

            fullWidth


            label="Transformer Name"


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

            fullWidth


            label="Transformer Code"


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


          {/* FEEDER */}

          <TextField

            select

            fullWidth


            label="Feeder"


            value={

              form.feeder || ""

            }


            onChange={(e) =>

              handleChange(

                "feeder",

                Number(
                  e.target.value
                )

              )

            }

          >


            <MenuItem
              value=""
            >

              Select Feeder

            </MenuItem>


            {

              feeders.map(

                (feeder) => (


                  <MenuItem

                    key={

                      feeder.id

                    }


                    value={

                      feeder.id

                    }

                  >


                    {

                      feeder.name

                    }


                    {" - "}


                    {

                      feeder.code

                    }


                    {" ("}


                    {

                      feeder.voltage_level

                    }

                    kV)


                  </MenuItem>


                )

              )

            }


          </TextField>


          {/* SCHEDULE */}

          <TextField

            select

            fullWidth


            label="Schedule"


            value={

              form.schedule

            }


            onChange={(e) =>

              handleChange(

                "schedule",

                e.target.value

              )

            }

          >


            <MenuItem
              value="lsh"
            >

              LSH

            </MenuItem>


            <MenuItem
              value="metered"
            >

              Metered

            </MenuItem>


            <MenuItem
              value="nlsh"
            >

              NLSH

            </MenuItem>


          </TextField>


          {/* STATUS */}

          <TextField

            select

            fullWidth


            label="Status"


            value={

              form.status

            }


            onChange={(e) =>

              handleChange(

                "status",

                e.target.value

              )

            }

          >


            <MenuItem
              value="active"
            >

              Active

            </MenuItem>


            <MenuItem
              value="inactive"
            >

              Inactive

            </MenuItem>


          </TextField>


          {/* ADDRESS */}

          <TextField

            fullWidth


            multiline


            rows={3}


            label="Address"


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


          {/* ACTIVE */}

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


            label="Active"

          />


        </Stack>


      </DialogContent>


      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}

      <DialogActions>


        <Button

          disabled={loading}


          onClick={

            onClose

          }

        >

          Cancel

        </Button>


        <Button

          variant="contained"


          disabled={loading}


          onClick={

            handleSubmit

          }

        >


          {

            loading

              ? "Saving..."

              : transformer

                ? "Update Transformer"

                : "Create Transformer"

          }


        </Button>


      </DialogActions>


    </Dialog>


  );


}