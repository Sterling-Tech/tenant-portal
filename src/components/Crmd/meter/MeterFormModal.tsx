import { useEffect, useState } from "react";

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
  getMeterMakes,
  Meter,
  MeterMake,
  MeterPayload,
} from "../../../services/crmdService";


interface Props {
  open: boolean;

  onClose: () => void;

  meter: Meter | null;

  loading: boolean;

  onSubmit: (
    payload: MeterPayload
  ) => void;
}


export default function MeterFormModal({
  open,
  onClose,
  meter,
  loading,
  onSubmit,
}: Props) {


  const [form, setForm] =
    useState<MeterPayload>({

      meter_number: "",

      customer: 0,

      metering_type: "prepaid",

      sgc: "",

      ti: "",

      krn: "",

      kct1: "",

      kct2: "",

      meter_make: 0,

      communication: "STS",

      units: "kWh",

      phases: "",

      multiplicity: "",

      number_of_digits: 0,

      initial_reading: "",

      status: "active",

      is_disconnected: false,

      installation_date: "",

      price: "",

      latitude: "",

      longitude: "",

      reason: "",

      reading: "",

      occurred_at: "",

      notes: "",

    });


  const [
    meterMakes,
    setMeterMakes,
  ] = useState<MeterMake[]>([]);


  // =========================
  // LOAD METER MAKES
  // =========================

  useEffect(() => {

    if (!open) {

      return;

    }


    const loadMeterMakes =
      async () => {

        try {

          const response =
            await getMeterMakes(
              "",
              1,
              100
            );


          const data =
            Array.isArray(response)

              ? response

              : response?.results ?? [];


          setMeterMakes(data);

        } catch (error) {

          console.error(
            "Failed to load meter makes",
            error
          );

        }

      };


    loadMeterMakes();

  }, [open]);


  // =========================
  // EDIT DATA
  // =========================

  useEffect(() => {

    if (meter) {

      setForm({

        meter_number:
          meter.meter_number ?? "",


        customer:
          meter.customer ?? 0,


        metering_type:
          meter.metering_type ?? "prepaid",


        sgc:
          meter.sgc ?? "",


        ti:
          meter.ti ?? "",


        krn:
          meter.krn ?? "",


        kct1:
          meter.kct1 ?? "",


        kct2:
          meter.kct2 ?? "",


        meter_make:
          meter.meter_make?.id ?? 0,


        communication:
          meter.communication ?? "STS",


        units:
          meter.units ?? "kWh",


        phases:
          meter.phases ?? "",


        multiplicity:
          meter.multiplicity ?? "",


        number_of_digits:
          meter.number_of_digits ?? 0,


        initial_reading:
          meter.initial_reading ?? "",


        status:
          meter.status ?? "active",


        is_disconnected:
          meter.is_disconnected ?? false,


        installation_date:

          meter.installation_date

            ? formatDateTime(
                meter.installation_date
              )

            : "",


        price:
          meter.price ?? "",


        latitude:
          meter.latitude ?? "",


        longitude:
          meter.longitude ?? "",


        /*
          These fields are
          required by your API payload
        */

        reason: "",

        reading:
          meter.initial_reading ?? "",

        occurred_at:
          "",

        notes: "",

      });

    } else {

      resetForm();

    }

  }, [

    meter,
    open,

  ]);


  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {

    setForm({

      meter_number: "",

      customer: 0,

      metering_type: "prepaid",

      sgc: "",

      ti: "",

      krn: "",

      kct1: "",

      kct2: "",

      meter_make: 0,

      communication: "STS",

      units: "kWh",

      phases: "",

      multiplicity: "",

      number_of_digits: 0,

      initial_reading: "",

      status: "active",

      is_disconnected: false,

      installation_date: "",

      price: "",

      latitude: "",

      longitude: "",

      reason: "",

      reading: "",

      occurred_at: "",

      notes: "",

    });

  };


  // =========================
  // FORMAT DATE
  // =========================

  function formatDateTime(
    value: string
  ) {

    const date =
      new Date(value);


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");


    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    const hours =
      String(
        date.getHours()
      ).padStart(2, "0");


    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, "0");


    return `${year}-${month}-${day}T${hours}:${minutes}`;

  }


  // =========================
  // CHANGE HANDLER
  // =========================

  const handleChange = (

    field:
      keyof MeterPayload,

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


    if (!form.meter_number.trim()) {

      alert(
        "Meter number is required"
      );

      return;

    }


    if (!form.customer) {

      alert(
        "Customer is required"
      );

      return;

    }


    if (!form.meter_make) {

      alert(
        "Please select a meter make"
      );

      return;

    }


    if (!form.installation_date) {

      alert(
        "Installation date is required"
      );

      return;

    }


    onSubmit({

      ...form,

      installation_date:

        new Date(
          form.installation_date
        ).toISOString(),


      occurred_at:

        form.occurred_at

          ? new Date(
              form.occurred_at
            ).toISOString()

          : new Date().toISOString(),

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

      maxWidth="md"

    >


      <DialogTitle>

        {
          meter
            ? "Edit Meter"
            : "Create Meter"
        }

      </DialogTitle>


      <DialogContent>


        <Stack
          spacing={2}
          mt={1}
        >


          {/* METER NUMBER */}

          <TextField

            fullWidth

            label="Meter Number"

            value={
              form.meter_number
            }

            onChange={(event) =>

              handleChange(
                "meter_number",
                event.target.value
              )

            }

          />


          {/* CUSTOMER */}

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
                Number(event.target.value)
              )

            }

          />


          {/* METERING TYPE */}

          <TextField

            select

            fullWidth

            label="Metering Type"

            value={
              form.metering_type
            }

            onChange={(event) =>

              handleChange(
                "metering_type",
                event.target.value
              )

            }

          >

            <MenuItem value="prepaid">

              Prepaid

            </MenuItem>


            <MenuItem value="postpaid">

              Postpaid

            </MenuItem>

          </TextField>


          {/* METER MAKE */}

          <TextField

            select

            fullWidth

            label="Meter Make"

            value={
              form.meter_make || ""
            }

            onChange={(event) =>

              handleChange(
                "meter_make",
                Number(event.target.value)
              )

            }

          >

            <MenuItem value="">

              Select Meter Make

            </MenuItem>


            {

              meterMakes.map(
                (make) => (

                  <MenuItem

                    key={make.id}

                    value={make.id}

                  >

                    {make.name}

                  </MenuItem>

                )
              )

            }

          </TextField>


          {/* SGC */}

          <TextField

            fullWidth

            label="SGC"

            value={form.sgc}

            onChange={(event) =>

              handleChange(
                "sgc",
                event.target.value
              )

            }

          />


          {/* TI */}

          <TextField

            fullWidth

            label="TI"

            value={form.ti}

            onChange={(event) =>

              handleChange(
                "ti",
                event.target.value
              )

            }

          />


          {/* KRN */}

          <TextField

            fullWidth

            label="KRN"

            value={form.krn}

            onChange={(event) =>

              handleChange(
                "krn",
                event.target.value
              )

            }

          />


          {/* KCT1 */}

          <TextField

            fullWidth

            label="KCT1"

            value={form.kct1}

            onChange={(event) =>

              handleChange(
                "kct1",
                event.target.value
              )

            }

          />


          {/* KCT2 */}

          <TextField

            fullWidth

            label="KCT2"

            value={form.kct2}

            onChange={(event) =>

              handleChange(
                "kct2",
                event.target.value
              )

            }

          />


          {/* PHASES */}

          <TextField

            fullWidth

            label="Phases"

            value={form.phases}

            onChange={(event) =>

              handleChange(
                "phases",
                event.target.value
              )

            }

          />


          {/* MULTIPLICITY */}

          <TextField

            fullWidth

            type="number"

            label="Multiplicity"

            value={form.multiplicity}

            onChange={(event) =>

              handleChange(
                "multiplicity",
                event.target.value
              )

            }

          />


          {/* DIGITS */}

          <TextField

            fullWidth

            type="number"

            label="Number of Digits"

            value={form.number_of_digits}

            onChange={(event) =>

              handleChange(
                "number_of_digits",
                Number(event.target.value)
              )

            }

          />


          {/* INITIAL READING */}

          <TextField

            fullWidth

            type="number"

            label="Initial Reading"

            value={form.initial_reading}

            onChange={(event) =>

              handleChange(
                "initial_reading",
                event.target.value
              )

            }

          />


          {/* PRICE */}

          <TextField

            fullWidth

            type="number"

            label="Price"

            value={form.price}

            onChange={(event) =>

              handleChange(
                "price",
                event.target.value
              )

            }

          />


          {/* STATUS */}

          <TextField

            select

            fullWidth

            label="Status"

            value={form.status}

            onChange={(event) =>

              handleChange(
                "status",
                event.target.value
              )

            }

          >

            <MenuItem value="active">

              Active

            </MenuItem>


            <MenuItem value="inactive">

              Inactive

            </MenuItem>

          </TextField>


          {/* DISCONNECTED */}

          <TextField

            select

            fullWidth

            label="Disconnected"

            value={
              String(
                form.is_disconnected
              )
            }

            onChange={(event) =>

              handleChange(
                "is_disconnected",
                event.target.value === "true"
              )

            }

          >

            <MenuItem value="false">

              No

            </MenuItem>


            <MenuItem value="true">

              Yes

            </MenuItem>

          </TextField>


          {/* INSTALLATION DATE */}

          <TextField

            fullWidth

            type="datetime-local"

            label="Installation Date"

            value={
              form.installation_date
            }

            InputLabelProps={{
              shrink: true,
            }}

            onChange={(event) =>

              handleChange(
                "installation_date",
                event.target.value
              )

            }

          />


          {/* LATITUDE */}

          <TextField

            fullWidth

            label="Latitude"

            value={form.latitude}

            onChange={(event) =>

              handleChange(
                "latitude",
                event.target.value
              )

            }

          />


          {/* LONGITUDE */}

          <TextField

            fullWidth

            label="Longitude"

            value={form.longitude}

            onChange={(event) =>

              handleChange(
                "longitude",
                event.target.value
              )

            }

          />


          {/* REASON */}

          <TextField

            fullWidth

            label="Reason"

            value={form.reason}

            onChange={(event) =>

              handleChange(
                "reason",
                event.target.value
              )

            }

          />


          {/* READING */}

          <TextField

            fullWidth

            type="number"

            label="Reading"

            value={form.reading}

            onChange={(event) =>

              handleChange(
                "reading",
                event.target.value
              )

            }

          />


          {/* OCCURRED AT */}

          <TextField

            fullWidth

            type="datetime-local"

            label="Occurred At"

            value={form.occurred_at}

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

            value={form.notes}

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

              : meter

                ? "Update Meter"

                : "Create Meter"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}