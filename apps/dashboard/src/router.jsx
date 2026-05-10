import { createBrowserRouter } from "react-router-dom";
import Login          from "./pages/Login";
import AppShell       from "./components/layout/AppShell";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import QueueBoard     from "./pages/QueueBoard";
import FloorView      from "./pages/FloorView";
import OrderManager   from "./pages/OrderManager";
import MenuManager    from "./pages/MenuManager";
import Analytics      from "./pages/Analytics";
import Settings       from "./pages/Settings";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/",          element: <QueueBoard />  },
          { path: "/floor",     element: <FloorView />   },
          { path: "/orders",    element: <OrderManager /> },
          { path: "/menu",      element: <MenuManager /> },
          { path: "/analytics", element: <Analytics />   },
          { path: "/settings",  element: <Settings />    },
        ],
      },
    ],
  },
  { path: "*", element: <Login /> },
]);

export default router;