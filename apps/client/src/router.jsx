import { createBrowserRouter } from "react-router-dom";
import Welcome      from "./pages/Welcome";
import OtpVerify   from "./pages/OtpVerify";
import QueueStatus from "./pages/QueueStatus";
import TableReady  from "./pages/TableReady";
import Menu        from "./pages/Menu";
import OrderTracker from "./pages/OrderTracker";
import TableSelect from "./pages/TableSelect";

const router = createBrowserRouter([
  // QR code points to: /join/:restaurantId
  { path: "/join/:restaurantId",  element: <Welcome /> },
  { path: "/auth/:restaurantId",  element: <OtpVerify /> },
  { path: "/select-table",        element: <TableSelect />  },
  { path: "/queue-status",        element: <QueueStatus /> },
  { path: "/table-ready",         element: <TableReady /> },
  { path: "/menu",                element: <Menu /> },
  { path: "/order-tracker",       element: <OrderTracker /> },
  { path: "*",                    element: <Welcome /> },
]);

export default router;