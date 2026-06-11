import { cache } from "react";
import { getFleetOverview, getAllVms } from "./admin";

// React cache() deduplicates calls to the same function within a single
// request/render cycle, so parallel route slots sharing this module only
// trigger one HTTP fetch per endpoint regardless of how many slots call it.
export const cachedGetFleetOverview = cache(getFleetOverview);
export const cachedGetAllVms = cache(getAllVms);
