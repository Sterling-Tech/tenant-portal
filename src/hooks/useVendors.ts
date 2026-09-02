import { useQuery } from "@tanstack/react-query";
import { getAllVendors } from "../services/onbordingService";

export const VENDORS_QUERY_KEY = ["vendors"];

export const useVendors = () => {
  return useQuery({
    queryKey: VENDORS_QUERY_KEY,
    queryFn: getAllVendors,
  });
};