import { instance } from "../axios/instance";

// Real Visitor API (lem-backend/routes/visitorRoutes.js). GET /visitors is
// paginated (page, limit) but has no server-side cap on `limit` and no
// date-range/aggregation support — callers that need a time-bucketed view
// (see src/pages/dashboard/dashboardUtils.js) fetch a bounded window and
// bucket client-side. Response: { total, page, limit, totalPages, visitors }.
// Visitor shape: { _id, ip, country, city, region, device, browser, os, page, referrer, createdAt }.

export const listVisitors = (params = {}) =>
  instance({ url: "/visitors", method: "GET", params });
