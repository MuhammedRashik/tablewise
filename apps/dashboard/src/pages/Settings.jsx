import { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useMyRestaurant, useUpdateSettings, useToggleQueue } from "../hooks/useRestaurant";
import { restaurantApi } from "../services/restaurant.api";
import { useAuthStore } from "../store/authStore";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";

export default function Settings() {
  const restaurantId    = useAuthStore((s) => s.restaurantId);
  const { data: rest, isLoading } = useMyRestaurant();
  const updateSettings  = useUpdateSettings();
  const toggleQueue     = useToggleQueue();

  const [settings, setSettings] = useState({
    totalTables:        10,
    autoBumpMinutes:    8,
    avgTurnoverMinutes: 40,
    maxQueueSize:       50,
  });
  const [qrData, setQrData]     = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [saved, setSaved]       = useState(false);

  // Hydrate from fetched restaurant
  useEffect(() => {
    if (rest?.settings) {
      const s = rest.settings;
      setSettings({
        totalTables:        s.totalTables        || 10,
        autoBumpMinutes:    s.autoBumpMinutes    || 8,
        avgTurnoverMinutes: s.avgTurnoverMinutes || 40,
        maxQueueSize:       s.maxQueueSize       || 50,
      });
    }
  }, [rest]);

  const setField = (key, val) =>
    setSettings((p) => ({ ...p, [key]: parseInt(val) || 0 }));

  const handleSave = () => {
    updateSettings.mutate(settings, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
    });
  };

  const loadQr = async () => {
    setQrLoading(true);
    try {
      const res = await restaurantApi.getQr(restaurantId);
      setQrData(res.data);
    } finally {
      setQrLoading(false);
    }
  };

  const regenQr = async () => {
    setQrLoading(true);
    try {
      const res = await restaurantApi.regenerateQr(restaurantId);
      setQrData(res.data);
    } finally {
      setQrLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5">

      {/* Restaurant info */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Restaurant</h2>
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-gray-900">{rest?.name}</p>
          <p className="text-sm text-gray-500">{rest?.address?.city}, {rest?.address?.state}</p>
          <p className="text-sm text-gray-500">{rest?.cuisine}</p>
        </div>
      </div>

      {/* Queue settings */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Queue settings</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Input
            label="Total tables"
            type="number"
            value={String(settings.totalTables)}
            onChange={(v) => setField("totalTables", v)}
          />
          <Input
            label="Auto-bump timeout (min)"
            type="number"
            value={String(settings.autoBumpMinutes)}
            onChange={(v) => setField("autoBumpMinutes", v)}
          />
          <Input
            label="Avg table turnover (min)"
            type="number"
            value={String(settings.avgTurnoverMinutes)}
            onChange={(v) => setField("avgTurnoverMinutes", v)}
          />
          <Input
            label="Max queue size"
            type="number"
            value={String(settings.maxQueueSize)}
            onChange={(v) => setField("maxQueueSize", v)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="btn-primary"
        >
          {saved ? "✓ Saved!" : updateSettings.isPending ? "Saving..." : "Save settings"}
        </button>
      </div>

      {/* Queue toggle */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Queue status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Queue is currently <span className="font-medium">{rest?.settings?.isQueueOpen ? "open" : "closed"}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Toggle to stop or allow new queue entries
            </p>
          </div>
          <button
            onClick={() => toggleQueue.mutate(!rest?.settings?.isQueueOpen)}
            disabled={toggleQueue.isPending}
            className={`relative w-12 h-6 rounded-full transition-colors ${rest?.settings?.isQueueOpen ? "bg-brand-400" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rest?.settings?.isQueueOpen ? "translate-x-6" : ""}`} />
          </button>
        </div>
      </div>

      {/* QR code */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">QR code</h2>
        <p className="text-xs text-gray-400 mb-4">
          Print and place this QR at each table. Customers scan it to join the queue.
        </p>

        {qrData ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={qrData.qrCode}
              alt="Restaurant QR code"
              className="w-48 h-48 rounded-xl border border-gray-200"
            />
            <p className="text-xs text-gray-400 break-all text-center">{qrData.qrUrl}</p>
            <div className="flex gap-2">
              <a
                href={qrData.qrCode}
                download="tablewise-qr.png"
                className="btn-primary text-sm"
              >
                <Download size={14} /> Download PNG
              </a>
              <button onClick={regenQr} disabled={qrLoading} className="btn-ghost text-sm">
                <RefreshCw size={14} className={qrLoading ? "animate-spin" : ""} />
                Regenerate
              </button>
            </div>
          </div>
        ) : (
          <button onClick={loadQr} disabled={qrLoading} className="btn-ghost">
            {qrLoading ? <Spinner size="sm" /> : "Load QR code"}
          </button>
        )}
      </div>
    </div>
  );
}