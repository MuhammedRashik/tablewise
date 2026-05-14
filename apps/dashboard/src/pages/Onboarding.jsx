import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { restaurantApi } from "../services/restaurant.api";
import { tableApi } from "../services/table.api";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const STEPS = ["Restaurant info", "Add tables", "Get QR code"];

const DEFAULT_TABLES = [
  { tableNumber:"T1", capacity:"2" },
  { tableNumber:"T2", capacity:"2" },
  { tableNumber:"T3", capacity:"4" },
  { tableNumber:"T4", capacity:"4" },
];

export default function Onboarding() {
  const navigate     = useNavigate();
  const { user, setAuth, token } = useAuthStore();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [qrData, setQrData] = useState(null);

  // Step 1 form
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [city, setCity]         = useState("");
  const [state, setState]       = useState("");
  const [pincode, setPincode]   = useState("");
  const [cuisine, setCuisine]   = useState("");

  // Step 2 form — editable table list
  const [tables, setTables] = useState(DEFAULT_TABLES);

  const addTableRow = () =>
    setTables((p) => [...p, { tableNumber:`T${p.length+1}`, capacity:"2" }]);

  const updateTable = (i, field, val) =>
    setTables((p) => p.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const removeTable = (i) =>
    setTables((p) => p.filter((_, idx) => idx !== i));

  // Step 1 submit
  const handleCreateRestaurant = async () => {
    if (!name.trim()) { setError("Restaurant name is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await restaurantApi.create({
        name, phone, cuisine,
        address: { city, state, pincode },
      });
      const r = res.data.restaurant;
      setRestaurant(r);
      // Update auth store with new restaurantId
      setAuth({ ...user, restaurantId: r._id }, token);
      setStep(1);
    } catch (err) {
      setError(err.message || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 submit
  const handleCreateTables = async () => {
    if (tables.length === 0) { setError("Add at least one table"); return; }
    setLoading(true); setError("");
    try {
      await tableApi.bulkCreate(restaurant._id, tables.map((t) => ({
        tableNumber: t.tableNumber,
        capacity:    parseInt(t.capacity),
      })));
      // Fetch QR
      const qrRes = await restaurantApi.getQr(restaurant._id);
      setQrData(qrRes.data);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to create tables");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-brand-400 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < step ? "bg-brand-400 text-white" :
                  i === step ? "bg-brand-50 text-brand-800 border-2 border-brand-400" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs ${i === step ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          {/* ── Step 0: Restaurant info ── */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Set up your restaurant</h2>
                <p className="text-sm text-gray-400 mt-1">This takes 2 minutes</p>
              </div>
              <Input label="Restaurant name *" value={name} onChange={setName} placeholder="e.g. Spice Garden" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone" value={phone} onChange={setPhone} placeholder="9876543210" type="tel" />
                <Input label="Cuisine" value={cuisine} onChange={setCuisine} placeholder="South Indian" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" value={city} onChange={setCity} placeholder="Chennai" />
                <Input label="State" value={state} onChange={setState} placeholder="Tamil Nadu" />
              </div>
              <Input label="Pincode" value={pincode} onChange={setPincode} placeholder="600001" maxLength={6} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleCreateRestaurant}
                disabled={loading || !name}
                className="btn-primary mt-2"
              >
                {loading ? "Creating..." : "Continue →"}
              </button>
            </div>
          )}

          {/* ── Step 1: Add tables ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Set up your tables</h2>
                <p className="text-sm text-gray-400 mt-1">You can add more later from Settings</p>
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {tables.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={t.tableNumber}
                      onChange={(e) => updateTable(i, "tableNumber", e.target.value)}
                      className="input-base flex-1"
                      placeholder="Table number"
                    />
                    <select
                      value={t.capacity}
                      onChange={(e) => updateTable(i, "capacity", e.target.value)}
                      className="input-base w-24"
                    >
                      {[1,2,3,4,5,6,8,10,12].map((n) => (
                        <option key={n} value={n}>{n} seats</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeTable(i)}
                      className="text-red-400 hover:text-red-600 px-2 text-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addTableRow}
                className="btn-ghost text-sm"
              >
                + Add another table
              </button>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleCreateTables}
                disabled={loading || tables.length === 0}
                className="btn-primary"
              >
                {loading ? "Setting up tables..." : "Create tables & get QR →"}
              </button>
            </div>
          )}

          {/* ── Step 2: QR code ── */}
          {step === 2 && (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="text-4xl">🎉</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">You're all set!</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Print this QR code and place it at your restaurant entrance
                </p>
              </div>
              {qrData?.qrCode && (
                <img
                  src={qrData.qrCode}
                  alt="Restaurant QR"
                  className="w-48 h-48 rounded-xl border border-gray-200"
                />
              )}
              <p className="text-xs text-gray-400 break-all px-4">{qrData?.qrUrl}</p>
            <div className="flex gap-3 w-full">
  {qrData?.qrCode && (
    <a
      href={qrData.qrCode}
      download="tablewise-qr.png"
      className="btn-primary flex-1 no-underline text-center"
    >
      Download QR
    </a>
  )}

  <button
    onClick={() => navigate("/")}
    className="btn-ghost flex-1"
  >
    Go to dashboard
  </button>
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}