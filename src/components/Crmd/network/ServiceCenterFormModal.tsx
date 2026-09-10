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

  useQuery,

} from "@tanstack/react-query";


import {

  ServiceCenter,

  ServiceCenterPayload,

  ServiceUnit,

  getServiceUnits,

} from "../../../services/crmdService"


interface Props {

  open: boolean;

  onClose: () => void;

  serviceCenter:
    ServiceCenter | null;

  loading: boolean;

  onSubmit: (
    payload:
      ServiceCenterPayload
  ) => void;

}


export default function ServiceCenterFormModal({

  open,

  onClose,

  serviceCenter,

  loading,

  onSubmit,

}: Props) {


  // =========================
  // FORM STATE
  // =========================

  const [

    form,

    setForm,

  ] = useState<ServiceCenterPayload>({

    name: "",

    code: "",

    service_unit: 0,

    address: "",

    is_active: true,

  });



  // =========================
  // FETCH SERVICE UNITS
  // =========================

  const {

    data:

      serviceUnitsData,

    isLoading:

      loadingServiceUnits,

  } = useQuery({

    queryKey:
      ["service-units"],


    queryFn: () =>

      getServiceUnits(
        "",
        1,
        100
      ),


    enabled:
      open,

  });



  // =========================
  // NORMALIZE RESPONSE
  // =========================

  const serviceUnits:
    ServiceUnit[] =

    Array.isArray(
      serviceUnitsData
    )

      ? serviceUnitsData

      : serviceUnitsData
          ?.results ?? [];


  // =========================
  // POPULATE FORM
  // =========================

  useEffect(() => {

    if (serviceCenter) {

      setForm({

        name:

          serviceCenter.name || "",


        code:

          serviceCenter.code || "",


        service_unit:

          serviceCenter
            .service_unit
            ?.id || 0,


        address:

          serviceCenter.address || "",


        is_active:

          serviceCenter.is_active,

      });

    } else {

      setForm({

        name: "",

        code: "",

        service_unit: 0,

        address: "",

        is_active: true,

      });

    }

  }, [

    serviceCenter,

    open,

  ]);



  // =========================
  // CHANGE HANDLER
  // =========================

  const handleChange = (

    field:
      keyof ServiceCenterPayload,

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


    if (!form.name.trim()) {

      return;

    }


    if (!form.code.trim()) {

      return;

    }


    if (!form.service_unit) {

      return;

    }


    onSubmit({

      ...form,


      name:

        form.name.trim(),


      code:

        form.code.trim(),


      address:

        form.address.trim(),

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


      {/* ===================== */}
      {/* TITLE */}
      {/* ===================== */}

      <DialogTitle>

        {

          serviceCenter

            ? "Edit Service Center"

            : "Create Service Center"

        }

      </DialogTitle>



      {/* ===================== */}
      {/* CONTENT */}
      {/* ===================== */}

      <DialogContent>


        <Stack

          spacing={2}

          mt={1}

        >


          {/* ================= */}
          {/* NAME */}
          {/* ================= */}

          <TextField

            label="Service Center Name"

            fullWidth

            required


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



          {/* ================= */}
          {/* CODE */}
          {/* ================= */}

          <TextField

            label="Service Center Code"

            fullWidth

            required


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



          {/* ================= */}
          {/* SERVICE UNIT */}
          {/* ================= */}

          <TextField

            select

            fullWidth

            required


            label="Service Unit"


            value={
              form.service_unit || ""
            }


            disabled={
              loadingServiceUnits
            }


            onChange={(e) =>

              handleChange(

                "service_unit",

                Number(
                  e.target.value
                )

              )

            }

          >


            <MenuItem
              value=""
            >

              Select Service Unit

            </MenuItem>



            {

              serviceUnits.map(

                (
                  serviceUnit
                ) => (

                  <MenuItem

                    key={
                      serviceUnit.id
                    }


                    value={
                      serviceUnit.id
                    }

                  >

                    {
                      serviceUnit.name
                    }

                    {" ("}

                    {
                      serviceUnit.code
                    }

                    {")"}

                  </MenuItem>

                )

              )

            }


          </TextField>



          {/* ================= */}
          {/* ADDRESS */}
          {/* ================= */}

          <TextField

            label="Address"

            fullWidth

            multiline

            minRows={3}


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



          {/* ================= */}
          {/* ACTIVE */}
          {/* ================= */}

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


            label="Active Service Center"

          />


        </Stack>


      </DialogContent>



      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}

      <DialogActions>


        <Button

          onClick={onClose}

          disabled={loading}

        >

          Cancel

        </Button>



        <Button

          variant="contained"


          disabled={

            loading ||

            !form.name.trim() ||

            !form.code.trim() ||

            !form.service_unit

          }


          onClick={
            handleSubmit
          }

        >

          {

            loading

              ? "Saving..."

              : serviceCenter

                ? "Update Service Center"

                : "Create Service Center"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}