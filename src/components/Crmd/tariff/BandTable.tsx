import {
  MoreVert,
} from "@mui/icons-material";

import {
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  Band,
} from "../../../services/crmdService";


interface Props {

  bands: Band[];

  onEdit: (
    band: Band
  ) => void;

  onDelete: (
    band: Band
  ) => void;

}


export default function BandTable({

  bands,

  onEdit,

  onDelete,

}: Props) {


  const [
    anchorEl,
    setAnchorEl,
  ] = useState<
    HTMLElement | null
  >(null);


  const [
    selectedBand,
    setSelectedBand,
  ] = useState<
    Band | null
  >(null);


  const openMenu =
    Boolean(anchorEl);


  const handleMenuOpen = (

    event:
      React.MouseEvent<HTMLButtonElement>,

    band:
      Band

  ) => {

    setAnchorEl(
      event.currentTarget
    );

    setSelectedBand(
      band
    );

  };


  const handleMenuClose = () => {

    setAnchorEl(
      null
    );

  };


  const handleEdit = () => {

    if (!selectedBand)
      return;


    onEdit(
      selectedBand
    );


    handleMenuClose();

  };


  const handleDelete = () => {

    if (!selectedBand)
      return;


    onDelete(
      selectedBand
    );


    handleMenuClose();

  };


  return (

    <TableContainer
      component={Paper}
      elevation={0}
    >

      <Table>


        {/* HEADER */}

        <TableHead>

          <TableRow>

            <TableCell>
              Name
            </TableCell>


            <TableCell>
              Category
            </TableCell>


            <TableCell>
              Description
            </TableCell>


            <TableCell>
              Baseline Hours
            </TableCell>


            <TableCell>
              Feeders
            </TableCell>


            <TableCell>
              Status
            </TableCell>


            <TableCell
              align="right"
            >
              Actions
            </TableCell>


          </TableRow>

        </TableHead>


        {/* BODY */}

        <TableBody>


          {

            bands.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={7}
                  align="center"
                >

                  No bands found

                </TableCell>

              </TableRow>

            )

          }


          {

            bands.map(

              (band) => (

                <TableRow
                  key={band.id}
                  hover
                >


                  <TableCell>

                    {band.name}

                  </TableCell>


                  <TableCell>

                    {band.category}

                  </TableCell>


                  <TableCell>

                    {band.description || "-"}

                  </TableCell>


                  <TableCell>

                    {band.baseline_hours}

                  </TableCell>


                  <TableCell>

                    {band.feeder_count}

                  </TableCell>


                  <TableCell>

                    <Chip

                      size="small"

                      label={

                        band.is_active

                          ? "Active"

                          : "Inactive"

                      }

                      color={

                        band.is_active

                          ? "success"

                          : "default"

                      }

                    />

                  </TableCell>


                  <TableCell
                    align="right"
                  >

                    <IconButton

                      onClick={(event) =>

                        handleMenuOpen(
                          event,
                          band
                        )

                      }

                    >

                      <MoreVert />

                    </IconButton>


                  </TableCell>


                </TableRow>

              )

            )

          }


        </TableBody>


      </Table>


      {/* ACTION MENU */}

      <Menu

        anchorEl={
          anchorEl
        }

        open={
          openMenu
        }

        onClose={
          handleMenuClose
        }

      >


        <MenuItem
          onClick={handleEdit}
        >

          Edit

        </MenuItem>


        <MenuItem
          onClick={handleDelete}
        >

          Delete

        </MenuItem>


      </Menu>


    </TableContainer>

  );

}