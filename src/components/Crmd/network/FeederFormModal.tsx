import {

  useEffect,

  useState,

} from "react";


import {

  Box,

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

  FeederPayload,

  getBusinessUnits,

  getFeeders,

  getSubstations,
   getBands,
   Band,

} from "../../../services/crmdService";


interface Props {

  open: boolean;

  onClose: () => void;

  feeder: Feeder | null;

  loading: boolean;

  onSubmit: (
    payload: FeederPayload
  ) => void;

}


export default function FeederFormModal({

  open,

  onClose,

  feeder,

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
    FeederPayload
  >({

    name: "",

    code: "",

    voltage_level: 33,

    parent: null,

    substation: 0,

    business_unit: 0,

    band: 0,

    status: "active",

    is_automated: false,

    is_active: true,

  });



  // =========================
  // OPTIONS
  // =========================


  const [

    substations,

    setSubstations,

  ] = useState<any[]>([]);



  const [

    businessUnits,

    setBusinessUnits,

  ] = useState<any[]>([]);



  const [

    parentFeeders,

    setParentFeeders,

  ] = useState<any[]>([]);
const [

  bands,

  setBands,

] = useState<Band[]>([]);


  // =========================
  // LOAD DATA
  // =========================


 useEffect(() => {

  if (!open)
    return;


  const loadData =
    async () => {

      try {

        const [

          substationResponse,

          businessUnitResponse,

          feederResponse,

          bandResponse,

        ] = await Promise.all([


          getSubstations(
            "",
            1,
            100
          ),


          getBusinessUnits(
            "",
            1,
            100
          ),


          getFeeders(

            "",

            1,

            100,

            undefined,

            undefined,

            undefined,

            undefined,

            undefined,

            33

          ),


          getBands(
            "",
            1,
            100
          ),


        ]);


        // =====================
        // SUBSTATIONS
        // =====================

        setSubstations(

          Array.isArray(
            substationResponse
          )

            ? substationResponse

            : substationResponse
                ?.results ?? []

        );


        // =====================
        // BUSINESS UNITS
        // =====================

        setBusinessUnits(

          Array.isArray(
            businessUnitResponse
          )

            ? businessUnitResponse

            : businessUnitResponse
                ?.results ?? []

        );


        // =====================
        // PARENT FEEDERS
        // =====================

        setParentFeeders(

          Array.isArray(
            feederResponse
          )

            ? feederResponse

            : feederResponse
                ?.results ?? []

        );


        // =====================
        // BANDS
        // =====================

        setBands(

          Array.isArray(
            bandResponse
          )

            ? bandResponse

            : bandResponse
                ?.results ?? []

        );


      } catch (error) {

        console.error(
          "Failed to load feeder options",
          error
        );

      }

    };


  loadData();


}, [open]);


  // =========================
  // EDIT DATA
  // =========================


  useEffect(() => {


    if (feeder) {


      setForm({


        name:

          feeder.name,


        code:

          feeder.code,


        voltage_level:

          feeder.voltage_level,


        parent:

          feeder.parent
            ?.id ?? null,


        substation:

          feeder.substation
            ?.id ?? 0,


        /*
          IMPORTANT:

          Your API returns
          business_unit as string.

          Ideally backend should
          return business_unit_id.

          You may need to adjust
          this based on API response.
        */

        business_unit:

          0,


        band:

          feeder.band_id ?? 0,


        status:

          feeder.status,


        is_automated:

          feeder.is_automated,


        is_active:

          feeder.is_active,


      });


    } else {


      setForm({


        name: "",

        code: "",

        voltage_level: 33,

        parent: null,

        substation: 0,

        business_unit: 0,

        band: 0,

        status: "active",

        is_automated: false,

        is_active: true,


      });


    }


  }, [

    feeder,

    open,

  ]);



  // =========================
  // CHANGE HANDLER
  // =========================


  const handleChange = (

    field:

      keyof FeederPayload,

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
  // VOLTAGE CHANGE
  // =========================


  const handleVoltageChange = (

    value:
      number

  ) => {


    setForm(

      (prev) => ({


        ...prev,


        voltage_level:
          value,


        /*
          33kV feeder
          does not require parent
        */

        parent:

          value === 33

            ? null

            : prev.parent,


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
        "Feeder name is required"
      );

      return;

    }



    if (

      !form.code.trim()

    ) {

      alert(
        "Feeder code is required"
      );

      return;

    }



    if (

      !form.substation

    ) {

      alert(
        "Substation is required"
      );

      return;

    }



    if (

      !form.business_unit

    ) {

      alert(
        "Business unit is required"
      );

      return;

    }



    // if (

    //   !form.band

    // ) {

    //   alert(
    //     "Band is required"
    //   );

    //   return;

    // }



    if (

      form.voltage_level === 11 &&

      !form.parent

    ) {

      alert(
        "Parent feeder is required for an 11kV feeder"
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

      maxWidth="md"

    >

      <DialogTitle className='bg-blue-900' color='white'>


        {

          feeder

            ? "Edit Feeder"

            : "Add Feeder"

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

            label="Feeder Name"


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

            label="Feeder Code"


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



          {/* VOLTAGE */}


          <TextField

            select

            fullWidth

            label="Voltage Level"


            value={
              form.voltage_level
            }


            onChange={(e) =>

              handleVoltageChange(

                Number(
                  e.target.value
                )

              )

            }

          >


            <MenuItem
              value={33}
            >

              33kV

            </MenuItem>


            <MenuItem
              value={11}
            >

              11kV

            </MenuItem>


          </TextField>



          {/* PARENT */}


          {

            form.voltage_level === 11 && (


              <TextField

                select

                fullWidth

                label="Parent 33kV Feeder"


                value={
                  form.parent ?? ""
                }


                onChange={(e) =>

                  handleChange(

                    "parent",

                    Number(
                      e.target.value
                    )

                  )

                }

              >


                <MenuItem
                  value=""
                >

                  Select Parent Feeder

                </MenuItem>


                {

                  parentFeeders.map(

                    (parent) => (

                      <MenuItem

                        key={
                          parent.id
                        }


                        value={
                          parent.id
                        }

                      >

                        {
                          parent.name
                        }

                        {" - "}

                        {
                          parent.code
                        }

                      </MenuItem>

                    )

                  )

                }


              </TextField>


            )

          }



          {/* SUBSTATION */}


          <TextField

            select

            fullWidth

            label="Substation"


            value={
              form.substation || ""
            }


            onChange={(e) =>

              handleChange(

                "substation",

                Number(
                  e.target.value
                )

              )

            }

          >


            <MenuItem
              value=""
            >

              Select Substation

            </MenuItem>


            {

              substations.map(

                (

                  substation

                ) => (

                  <MenuItem

                    key={
                      substation.id
                    }


                    value={
                      substation.id
                    }

                  >

                    {
                      substation.name
                    }

                    {" - "}

                    {
                      substation.code
                    }

                  </MenuItem>

                )

              )

            }


          </TextField>



          {/* BUSINESS UNIT */}


          <TextField

            select

            fullWidth

            label="Business Unit"


            value={
              form.business_unit || ""
            }


            onChange={(e) =>

              handleChange(

                "business_unit",

                Number(
                  e.target.value
                )

              )

            }

          >


            <MenuItem
              value=""
            >

              Select Business Unit

            </MenuItem>


            {

              businessUnits.map(

                (

                  businessUnit

                ) => (

                  <MenuItem

                    key={
                      businessUnit.id
                    }


                    value={
                      businessUnit.id
                    }

                  >

                    {
                      businessUnit.name
                    }

                    {" - "}

                    {
                      businessUnit.code
                    }

                  </MenuItem>

                )

              )

            }


          </TextField>



          {/* BAND */}


          {/* <TextField

            fullWidth

            type="number"

            label="Band ID"


            value={
              form.band || ""
            }


            onChange={(e) =>

              handleChange(

                "band",

                Number(
                  e.target.value
                )

              )

            }

          /> */}

          <TextField

  select

  fullWidth

  label="Tariff Band"


  value={
    form.band || ""
  }


  onChange={(e) =>

    handleChange(

      "band",

      Number(
        e.target.value
      )

    )

  }

>


  <MenuItem
    value=""
  >

    Select Tariff Band

  </MenuItem>


  {

    bands

      .filter(
        (band) =>
          band.is_active
      )

      .map(

        (band) => (

          <MenuItem

            key={
              band.id
            }


            value={
              band.id
            }

          >

            {band.name}

            {" - "}

            {band.category}


          </MenuItem>

        )

      )

  }


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



          {/* AUTOMATION */}


          <FormControlLabel

            control={

              <Switch

                checked={
                  form.is_automated
                }


                onChange={(e) =>

                  handleChange(

                    "is_automated",

                    e.target.checked

                  )

                }

              />

            }


            label="Automated Feeder"

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

              : feeder

                ? "Update Feeder"

                : "Create Feeder"

          }

        </Button>


      </DialogActions>


    </Dialog>


  );

}