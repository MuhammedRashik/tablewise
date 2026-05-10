import { useEffect } from "react";
import { useKitchenStore } from "./store/kitchenStore";
import { connectSocket } from "./lib/socket";
import KitchenLogin from "./pages/KitchenLogin";
import KOTBoard     from "./pages/KOTBoard";

export default function App() {
  const { isLoggedIn, token } = useKitchenStore();

  // Reconnect socket on page refresh
  useEffect(() => {
    if (isLoggedIn() && token) connectSocket(token);
  }, []);

  // No router needed — just two states: logged in or not
  return isLoggedIn() ? <KOTBoard /> : <KitchenLogin />;
}