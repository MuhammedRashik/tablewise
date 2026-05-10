import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useFloor } from "../hooks/useFloor";
import TableCell from "../components/floor/TableCell";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Spinner from "../components/ui/Spinner";

const LEGEND = [
  { status: "available", color: "bg-brand-400", label: "Free" },
  { status: "occupied",  color: "bg-amber-400",  label: "Occupied" },
  { status: "cleaning",  color: "bg-blue-400",   label: "Cleaning" },
  { status: "reserved",  color: "bg-purple-400", label: "Reserved" },
];

export default function FloorView() {
  const { tables, counts, isLoading, refetch, updateStatus, createTable, isUpdating } = useFloor();
  const [addOpen, setAddOpen]     = useState(false);
  const [tableNum, setTableNum]   = useState("");
  const [capacity, setCapacity]   = useState("2");
  const [location, setLocation]   = useState("");

  const handleCreate = () => {
    if (!tableNum || !capacity) return;
    createTable({ tableNumber: tableNum, capacity: parseInt(capacity), location });
    setAddOpen(false);
    setTableNum(""); setCapacity("2"); setLocation("");
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Free"     value={counts.available || 0} color="green"  />
        <StatCard label="Occupied" value={counts.occupied  || 0} color="amber"  />
        <StatCard label="Cleaning" value={counts.cleaning  || 0} color="blue"   />
        <StatCard label="Total"    value={tables.length}          color="gray"   />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          {LEGEND.map((l) => (
            <div key={l.status} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="btn-ghost h-8 px-3 text-xs">
            <RefreshCw size={13} />
            Refresh
          </button>
          <button onClick={() => setAddOpen(true)} className="btn-primary h-8 px-3 text-xs">
            <Plus size={13} />
            Add table
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="card">
        <p className="text-xs text-gray-400 mb-3">Click a table to cycle its status</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {tables.map((table) => (
            <TableCell
              key={table._id}
              table={table}
              onStatusChange={updateStatus}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </div>

      {/* Add table modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add table" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Table number" value={tableNum} onChange={setTableNum} placeholder="e.g. T9, VIP-1" />
          <Select
            label="Capacity"
            value={capacity}
            onChange={setCapacity}
            options={[2,3,4,5,6,8,10,12].map((n) => ({ value: String(n), label: `${n} seats` }))}
          />
          <Input label="Location hint (optional)" value={location} onChange={setLocation} placeholder="e.g. Window, Outdoor" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => setAddOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleCreate} className="btn-primary flex-1">Create table</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}