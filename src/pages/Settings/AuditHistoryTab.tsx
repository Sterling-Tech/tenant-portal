// import { TextField } from "@mui/material";
// import { useEffect, useState } from "react";

// const [history, setHistory] = useState<ObjectHistory[]>([]);
// const [loading, setLoading] = useState(false);

// const [page, setPage] = useState(1);
// const [count, setCount] = useState(0);
// const [next, setNext] = useState<string | null>(null);
// const [previous, setPrevious] = useState<string | null>(null);

// const today = new Date().toISOString().slice(0, 10);

// const [filters, setFilters] = useState({
//     start_date: today,
//     end_date: today,
//     action: "",
//     model_name: "",
//     actor_id: "",
//     object_id: "",
// });

// const loadHistory = useCallback(async (pageNumber = 1) => {

//     try {

//         setLoading(true);

//         const res = await auditService.getHistory({

//             page: pageNumber,

//             start_date: filters.start_date,

//             end_date: filters.end_date,

//             action: filters.action || undefined,

//             model_name: filters.model_name || undefined,

//             actor_id: filters.actor_id || undefined,

//             object_id: filters.object_id || undefined

//         });

//         setHistory(res.results);

//         setCount(res.count);

//         setNext(res.next);

//         setPrevious(res.previous);

//     }

//     finally {

//         setLoading(false);

//     }

// }, [filters]);

// useEffect(() => {

//     loadHistory(page);

// }, [page, loadHistory]);

// const previousObj = JSON.parse(previous ?? "{}");

// const presentObj = JSON.parse(present ?? "{}");

// const keys = Array.from(

// new Set([

// ...Object.keys(previousObj),

// ...Object.keys(presentObj)

// ])

// );

// return (
//     <Paper sx={{ p: 2, mb: 3 }}>

//         <Grid container spacing={2}>

//             <Grid item xs={12} md={3}>

//                 <TextField
//                     fullWidth
//                     label="Model"
//                     value={filters.model_name}
//                     onChange={(e) =>
//                         setFilters(v => ({ ...v, model_name: e.target.value }))
//                     }
//                 />

//             </Grid>

//             <Grid item xs={12} md={2}>

//                 <FormControl fullWidth>

//                     <Select
//                         displayEmpty
//                         value={filters.action}
//                         onChange={(e) =>
//                             setFilters(v => ({ ...v, action: e.target.value }))
//                         }
//                     >

//                         <MenuItem value="">All Actions</MenuItem>

//                         <MenuItem value="CREATE">
//                             CREATE
//                         </MenuItem>

//                         <MenuItem value="UPDATE">
//                             UPDATE
//                         </MenuItem>

//                         <MenuItem value="DELETE">
//                             DELETE
//                         </MenuItem>

//                     </Select>

//                 </FormControl>

//             </Grid>

//             <Grid item xs={12} md={2}>

//                 <TextField
//                     label="Actor ID"
//                     value={filters.actor_id}
//                     onChange={(e) =>
//                         setFilters(v => ({ ...v, actor_id: e.target.value }))
//                     }
//                 />

//             </Grid>

//             <Grid item xs={12} md={2}>

//                 <TextField
//                     label="Object ID"
//                     value={filters.object_id}
//                     onChange={(e) =>
//                         setFilters(v => ({ ...v, object_id: e.target.value }))
//                     }
//                 />

//             </Grid>

//             <Grid item xs={6} md={1.5}>

//                 <TextField
//                     type="date"
//                     label="From"
//                     InputLabelProps={{ shrink: true }}
//                     value={filters.start_date}
//                     onChange={(e) =>
//                         setFilters(v => ({ ...v, start_date: e.target.value }))
//                     }
//                 />

//             </Grid>

//             <Grid item xs={6} md={1.5}>

//                 <TextField
//                     type="date"
//                     label="To"
//                     InputLabelProps={{ shrink: true }}
//                     value={filters.end_date}
//                     onChange={(e) =>
//                         setFilters(v => ({ ...v, end_date: e.target.value }))
//                     }
//                 />

//             </Grid>

//         </Grid>
//         <Card>

//             <CardContent>

//                 <Stack
//                     direction="row"
//                     justifyContent="space-between"
//                 >

//                     <Box>

//                         <Typography fontWeight={700}>

//                             {log.model_name}

//                         </Typography>

//                         <Typography color="text.secondary">

//                             Object ID:
//                             {log.object_id}

//                         </Typography>

//                     </Box>

//                     <Chip

//                         label={log.action}

//                         color={actionColor(log.action)}

//                     />

//                 </Stack>

//                 <Divider sx={{ my: 2 }} />

//                 <Stack
//                     direction="row"
//                     spacing={4}
//                 >

//                     <Typography>

//                         Actor:

//                         <strong>{log.actor_email}</strong>

//                     </Typography>

//                     <Typography>

//                         IP:

//                         {log.ip_address}

//                     </Typography>

//                     <Typography>

//                         {formatDate(log.timestamp)}

//                     </Typography>

//                 </Stack>

//                 <HistoryComparison

//                     previous={log.previous}

//                     present={log.present}

//                 />

//             </CardContent>
//                     {keys.map(key=>{

// const before=previousObj[key];

// const after=presentObj[key];

// const changed=
// JSON.stringify(before)!==
// JSON.stringify(after);

// if(!changed) return null;

// return(

// <Grid
// container
// key={key}
// sx={{
// py:1,
// borderBottom:"1px solid #eee"
// }}
// >

// <Grid item xs={3}>

// <Typography fontWeight={700}>

// {key}

// </Typography>

// </Grid>

// <Grid item xs={4}>

// <Typography color="error">

// {String(before)}

// </Typography>

// </Grid>

// <Grid item xs={1}>

// →

// </Grid>

// <Grid item xs={4}>

// <Typography color="success.main">

// {String(after)}

// </Typography>

// </Grid>

// </Grid>

// );

// })}
//         </Card>
//     </Paper>
// )

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import HistoryFilters from "./HistoryFilters";


import {
  AuditHistoryQuery,
  ObjectHistory,
} from "./auditTypes";



import { getErrorMessage } from "../../utils/getErrorMessage";
import auditService from "./AuditService";
import HistoryCard from "./HistoryCard";

const today = new Date().toISOString().slice(0, 10);

export default function AuditHistoryPage() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [history, setHistory] = useState<ObjectHistory[]>([]);

  const [page, setPage] = useState(1);

  const [count, setCount] = useState(0);

  const pageSize = 20;

  const [filters, setFilters] =
    useState<AuditHistoryQuery>({
      start_date: today,
      end_date: today,
      action: "",
      model_name: "",
      actor_id: undefined,
      object_id: "",
      request_id: "",
    });

  const loadHistory = useCallback(
    async (pageNumber = page) => {
      try {
        setLoading(true);
        setError("");

        const res =
          await auditService.getHistory({
            ...filters,
            page: pageNumber,
          });

        setHistory(res.results);

        setCount(res.count);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [filters, page]
  );

  useEffect(() => {
    loadHistory(page);
  }, [page, loadHistory]);

  const handleRefresh = () => {
    setPage(1);
    loadHistory(1);
  };

  return (
    <Box>

      <Typography
        variant="h5"
        fontWeight={700}
        mb={3}
        ml={3}
      >
        Audit History
      </Typography>

      <HistoryFilters
        filters={filters}
        setFilters={setFilters}
        onSearch={handleRefresh}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          py={10}
          textAlign="center"
        >
          <CircularProgress />
        </Box>
      ) : history.length === 0 ? (
        <Box py={8} textAlign="center">
          <Typography color="text.secondary">
            No audit history found.
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={2} mt={3}>
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                history={item}
              />
            ))}
          </Stack>

          <Box
            mt={4}
            display="flex"
            justifyContent="center"
          >
            <Pagination
              page={page}
              count={Math.ceil(count / pageSize)}
              color="primary"
              onChange={(_, value) =>
                setPage(value)
              }
            />
          </Box>
        </>
      )}
    </Box>
  );
}