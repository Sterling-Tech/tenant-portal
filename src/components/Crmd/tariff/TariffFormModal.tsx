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
  Tariff,
  TariffPayload,
  Band,
  TariffCategory,
  getBands,
  getTariffCategories,
} from "../../../services/crmdService";


interface MeteringType {
  id: number;
  name: string;
}


const METERING_TYPES: MeteringType[] = [
  {
    id: 1,
    name: "Prepaid",
  },
  {
    id: 2,
    name: "Postpaid",
  },
];


interface Props {
  open: boolean;

  onClose: () => void;

  tariff: Tariff | null;

  loading: boolean;

  onSubmit: (
    payload: TariffPayload
  ) => void;
}


export default function TariffFormModal({
  open,
  onClose,
  tariff,
  loading,
  onSubmit,
}: Props) {


  // =========================
  // FORM STATE
  // =========================

  const [form, setForm] =
    useState<TariffPayload>({
      band: 0,

      category: 0,

      metering_type: 0,

      name: "",

      rate: "",

      tariff_index: "",

      effective_from: "",

      effective_to: "",
    });


  // =========================
  // OPTIONS
  // =========================

  const [bands, setBands] =
    useState<Band[]>([]);


  const [
    categories,
    setCategories,
  ] = useState<TariffCategory[]>([]);


  // =========================
  // LOAD OPTIONS
  // =========================

  useEffect(() => {

    if (!open) {
      return;
    }


    const loadOptions =
      async () => {

        try {

          const [

            bandResponse,

            categoryResponse,

          ] = await Promise.all([

            getBands(
              "",
              1,
              100
            ),

            getTariffCategories(
              "",
              1,
              100
            ),

          ]);


          // =====================
          // BANDS
          // =====================

          setBands(

            Array.isArray(
              bandResponse
            )

              ? bandResponse

              : bandResponse?.results ?? []

          );


          // =====================
          // CATEGORIES
          // =====================

          setCategories(

            Array.isArray(
              categoryResponse
            )

              ? categoryResponse

              : categoryResponse?.results ?? []

          );


        } catch (error) {

          console.error(
            "Failed to load tariff options",
            error
          );

        }

      };


    loadOptions();


  }, [open]);


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
  // EDIT DATA
  // =========================

  useEffect(() => {

    if (tariff) {

      setForm({

        band:
          tariff.band?.id ?? 0,


        category:
          tariff.category?.id ?? 0,


        /*
          Backend returns metering_type
          as a string.

          We match the returned name
          with our hardcoded options.
        */

        metering_type:

          METERING_TYPES.find(
            (type) =>

              type.name.toLowerCase() ===
              tariff.metering_type?.toLowerCase()

          )?.id ?? 0,


        name:
          tariff.name ?? "",


        rate:
          tariff.rate ?? "",


        tariff_index:
          tariff.tariff_index ?? "",


        effective_from:

          tariff.effective_from

            ? formatDateTime(
                tariff.effective_from
              )

            : "",


        effective_to:

          tariff.effective_to

            ? formatDateTime(
                tariff.effective_to
              )

            : "",

      });

    } else {

      setForm({

        band: 0,

        category: 0,

        metering_type: 0,

        name: "",

        rate: "",

        tariff_index: "",

        effective_from: "",

        effective_to: "",

      });

    }

  }, [

    tariff,

    open,

  ]);


  // =========================
  // CHANGE HANDLER
  // =========================

  const handleChange = (

    field:
      keyof TariffPayload,

    value:
      string | number

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


    if (!form.band) {

      alert(
        "Please select a band"
      );

      return;

    }


    if (!form.category) {

      alert(
        "Please select a tariff category"
      );

      return;

    }


    if (!form.metering_type) {

      alert(
        "Please select a metering type"
      );

      return;

    }


    if (!form.name.trim()) {

      alert(
        "Tariff name is required"
      );

      return;

    }


    if (!form.rate) {

      alert(
        "Tariff rate is required"
      );

      return;

    }


    if (!form.tariff_index.trim()) {

      alert(
        "Tariff index is required"
      );

      return;

    }


    if (!form.effective_from) {

      alert(
        "Effective from date is required"
      );

      return;

    }


    if (!form.effective_to) {

      alert(
        "Effective to date is required"
      );

      return;

    }


    onSubmit({

      ...form,


      effective_from:

        form.effective_from
          ? new Date(
              form.effective_from
            ).toISOString()
          : "",


      effective_to:

        form.effective_to
          ? new Date(
              form.effective_to
            ).toISOString()
          : "",

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


      <DialogTitle className='bg-blue-900' color='white'>

        {
          tariff
            ? "Edit Tariff"
            : "Publish Tariff"
        }

      </DialogTitle>


      <DialogContent>


        <Stack
          spacing={2}
          mt={3}
        >


          {/* ================= */}
          {/* NAME */}
          {/* ================= */}

          <TextField

            fullWidth

            label="Tariff Name"

            value={form.name}

            onChange={(event) =>

              handleChange(
                "name",
                event.target.value
              )

            }

          />


          {/* ================= */}
          {/* BAND */}
          {/* ================= */}

          <TextField

            select

            fullWidth

            label="Band"

            value={
              form.band || ""
            }

            onChange={(event) =>

              handleChange(
                "band",
                Number(event.target.value)
              )

            }

          >

            <MenuItem value="">
              Select Band
            </MenuItem>


            {

              bands.map(
                (band) => (

                  <MenuItem
                    key={band.id}
                    value={band.id}
                  >

                    {band.name}

                    {" - "}

                    {band.category}

                  </MenuItem>

                )
              )

            }

          </TextField>


          {/* ================= */}
          {/* CATEGORY */}
          {/* ================= */}

          <TextField

            select

            fullWidth

            label="Tariff Category"

            value={
              form.category || ""
            }

            onChange={(event) =>

              handleChange(
                "category",
                Number(event.target.value)
              )

            }

          >

            <MenuItem value="">
              Select Category
            </MenuItem>


            {

              categories.map(
                (category) => (

                  <MenuItem
                    key={category.id}
                    value={category.id}
                  >

                    {category.name}

                    {" - "}

                    {category.legacy_name}

                  </MenuItem>

                )
              )

            }

          </TextField>


          {/* ================= */}
          {/* METERING TYPE */}
          {/* ================= */}

          <TextField

            select

            fullWidth

            label="Metering Type"

            value={
              form.metering_type || ""
            }

            onChange={(event) =>

              handleChange(

                "metering_type",

                Number(
                  event.target.value
                )

              )

            }

          >

            <MenuItem value="">
              Select Metering Type
            </MenuItem>


            {

              METERING_TYPES.map(
                (meteringType) => (

                  <MenuItem

                    key={
                      meteringType.id
                    }

                    value={
                      meteringType.id
                    }

                  >

                    {
                      meteringType.name
                    }

                  </MenuItem>

                )
              )

            }

          </TextField>


          {/* ================= */}
          {/* RATE */}
          {/* ================= */}

          <TextField

            fullWidth

            type="number"

            label="Rate"

            value={form.rate}

            onChange={(event) =>

              handleChange(
                "rate",
                event.target.value
              )

            }

          />


          {/* ================= */}
          {/* TARIFF INDEX */}
          {/* ================= */}

          <TextField

            fullWidth

            label="Tariff Index"

            value={
              form.tariff_index
            }

            onChange={(event) =>

              handleChange(
                "tariff_index",
                event.target.value
              )

            }

          />


          {/* ================= */}
          {/* EFFECTIVE FROM */}
          {/* ================= */}

          <TextField

            fullWidth

            type="datetime-local"

            label="Effective From"

            value={
              form.effective_from
            }

            InputLabelProps={{
              shrink: true,
            }}

            onChange={(event) =>

              handleChange(
                "effective_from",
                event.target.value
              )

            }

          />


          {/* ================= */}
          {/* EFFECTIVE TO */}
          {/* ================= */}

          <TextField

            fullWidth

            type="datetime-local"

            label="Effective To"

            value={
              form.effective_to
            }

            InputLabelProps={{
              shrink: true,
            }}

            onChange={(event) =>

              handleChange(
                "effective_to",
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

              : tariff

                ? "Update Tariff"

                : "Publish Tariff"

          }

        </Button>


      </DialogActions>


    </Dialog>

  );

}