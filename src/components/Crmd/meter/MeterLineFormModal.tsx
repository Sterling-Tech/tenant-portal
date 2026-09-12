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

  MenuItem,

  Stack,

  TextField,

} from "@mui/material";


import {

  getMeters,

  Meter,

  MeterAction,

  MeterLinePayload,

} from "../../../services/crmdService";


interface Props {

  open: boolean;

  loading: boolean;

  onClose: () => void;

  onSubmit: (

    payload: MeterLinePayload

  ) => void;

}


const actions: MeterAction[] = [

  "installed",

  "assigned",

  "unassigned",

  "disconnected",

  "reconnected",

  "replaced",

  "retired",

  "received",

];


export default function MeterLineFormModal({

  open,

  loading,

  onClose,

  onSubmit,

}: Props) {


  // =========================
  // FORM
  // =========================

  const [form, setForm] =
    useState<MeterLinePayload>({

      meter: 0,

      customer: 0,

      related_meter: 0,

      action: "received",

      reading: "",

      related_reading: "",

      reason: "",

      notes: "",

      occurred_at: "",

    });


  const [

    meters,

    setMeters,

  ] = useState<Meter[]>([]);


  // =========================
  // LOAD METERS
  // =========================

  useEffect(() => {

    if (!open) {

      return;

    }


    const loadMeters =
      async () => {

        try {

          const response =
            await getMeters(
              "",
              1,
              100
            );


          const data =

            Array.isArray(response)

              ? response

              : response?.results ?? [];


          setMeters(data);

        } catch (error) {

          console.error(

            "Failed to load meters",

            error

          );

        }

      };


    loadMeters();

  }, [open]);


  // =========================
  // RESET
  // =========================

  useEffect(() => {

    if (open) {

      setForm({

        meter: 0,

        customer: 0,

        related_meter: 0,

        action: "received",

        reading: "",

        related_reading: "",

        reason: "",

        notes: "",

        occurred_at: "",

      });

    }

  }, [open]);


  // =========================
  // CHANGE
  // =========================

  const handleChange = (

    field:
      keyof MeterLinePayload,

    value: any

  ) => {

    setForm(

      (previous) => ({

        ...previous,

        [field]:
          value,

      })

    );

  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = () => {


    if (!form.meter) {

      alert(
        "Please select a meter"
      );

      return;

    }


    if (!form.action) {

      alert(
        "Please select an action"
      );

      return;

    }


    if (

      form.action === "installed" ||

      form.action === "assigned"

    ) {

      if (!form.customer) {

        alert(
          "Customer is required"
        );

        return;

      }

    }


    if (

      form.action === "replaced"

    ) {

      if (!form.related_meter) {

        alert(
          "Related meter is required"
        );

        return;

      }

    }


    if (!form.reading) {

      alert(
        "Meter reading is required"
      );

      return;

    }


    if (!form.reason.trim()) {

      alert(
        "Reason is required"
      );

      return;

    }


    onSubmit({

      ...form,


      customer:

        form.customer || undefined,


      related_meter:

        form.related_meter || undefined,


      related_reading:

        form.related_reading
          || undefined,


      occurred_at:

        form.occurred_at

          ? new Date(

              form.occurred_at

            ).toISOString()

          : new Date().toISOString(),

    });

  };


  const requiresCustomer =

    form.action === "installed"

    ||

    form.action === "assigned";


  const requiresRelatedMeter =

    form.action === "replaced";


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

        Record Meter Action

      </DialogTitle>


      <DialogContent>


        <Stack

          spacing={2}

          mt={1}

        >


          {/* METER */}

          <TextField

            select

            fullWidth

            label="Meter"

            value={
              form.meter || ""
            }

            onChange={(event) =>

              handleChange(

                "meter",

                Number(event.target.value)

              )

            }

          >

            <MenuItem value="">

              Select Meter

            </MenuItem>


            {

              meters.map(

                (meter) => (

                  <MenuItem

                    key={meter.id}

                    value={meter.id}

                  >

                    {meter.meter_number}

                  </MenuItem>

                )

              )

            }

          </TextField>


          {/* ACTION */}

          <TextField

            select

            fullWidth

            label="Action"

            value={
              form.action
            }

            onChange={(event) =>

              handleChange(

                "action",

                event.target.value

              )

            }

          >

            {

              actions.map(

                (action) => (

                  <MenuItem

                    key={action}

                    value={action}

                  >

                    {

                      action

                        .replace(
                          "_",
                          " "
                        )

                        .replace(

                          /^\w/,

                          (letter) =>

                            letter.toUpperCase()

                        )

                    }

                  </MenuItem>

                )

              )

            }

          </TextField>


          {/* CUSTOMER */}

          {

            requiresCustomer

              && (

                <TextField

                  fullWidth

                  type="number"

                  label="Customer ID"

                  value={
                    form.customer || ""
                  }

                  onChange={(event) =>

                    handleChange(

                      "customer",

                      Number(
                        event.target.value
                      )

                    )

                  }

                />

              )

          }


          {/* RELATED METER */}

          {

            requiresRelatedMeter

              && (

                <TextField

                  select

                  fullWidth

                  label="Replacement Meter"

                  value={
                    form.related_meter || ""
                  }

                  onChange={(event) =>

                    handleChange(

                      "related_meter",

                      Number(
                        event.target.value
                      )

                    )

                  }

                >

                  <MenuItem value="">

                    Select Meter

                  </MenuItem>


                  {

                    meters

                      .filter(

                        (meter) =>

                          meter.id !==
                          form.meter

                      )

                      .map(

                        (meter) => (

                          <MenuItem

                            key={meter.id}

                            value={meter.id}

                          >

                            {
                              meter.meter_number
                            }

                          </MenuItem>

                        )

                      )

                  }

                </TextField>

              )

          }


          {/* READING */}

          <TextField

            fullWidth

            type="number"

            label="Meter Reading"

            value={
              form.reading
            }

            onChange={(event) =>

              handleChange(

                "reading",

                event.target.value

              )

            }

          />


          {/* RELATED READING */}

          {

            requiresRelatedMeter

              && (

                <TextField

                  fullWidth

                  type="number"

                  label="Related Meter Reading"

                  value={
                    form.related_reading
                  }

                  onChange={(event) =>

                    handleChange(

                      "related_reading",

                      event.target.value

                    )

                  }

                />

              )

          }


          {/* REASON */}

          <TextField

            fullWidth

            label="Reason"

            value={
              form.reason
            }

            onChange={(event) =>

              handleChange(

                "reason",

                event.target.value

              )

            }

          />


          {/* OCCURRED AT */}

          <TextField

            fullWidth

            type="datetime-local"

            label="Occurred At"

            value={
              form.occurred_at
            }

            InputLabelProps={{

              shrink: true,

            }}

            onChange={(event) =>

              handleChange(

                "occurred_at",

                event.target.value

              )

            }

          />


          {/* NOTES */}

          <TextField

            fullWidth

            multiline

            minRows={3}

            label="Notes"

            value={
              form.notes
            }

            onChange={(event) =>

              handleChange(

                "notes",

                event.target.value

              )

            }

          />


        </Stack>


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

          disabled={loading}

          onClick={handleSubmit}

        >

          {

            loading

              ? "Saving..."

              : "Record Action"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}