import { Users, Clock, CheckCircle, PhoneCall } from "lucide-react";
import { useLiveQueue } from "../hooks/useLiveQueue";
import { useMyRestaurant } from "../hooks/useRestaurant";
import { useToggleQueue } from "../hooks/useRestaurant";
import PartyCard from "../components/queue/PartyCard";
import StatCard from "../components/ui/StatCard";
import Spinner from "../components/ui/Spinner";

export default function QueueBoard() {
  const {
    queueEntries, queueSummary,
    confirmEntry, callCustomer, seatCustomer,
    bumpCustomer, markNoShow, isActing,
  } = useLiveQueue();

  const { data: restaurant } = useMyRestaurant();
  const toggleQueue          = useToggleQueue();

  if (!queueEntries) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const isOpen = restaurant?.settings?.isQueueOpen;

  return (
    <div className="flex flex-col gap-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total waiting" value={queueSummary.total}    color="blue"   icon={Users} />
        <StatCard label="Waiting"        value={queueSummary.waiting}  color="gray"   icon={Clock} />
        <StatCard label="Confirmed"      value={queueSummary.confirmed}color="blue"   icon={CheckCircle} />
        <StatCard label="Called"         value={queueSummary.called}   color="amber"  icon={PhoneCall} />
      </div>

      {/* Queue open/close toggle */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Queue status</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isOpen ? "Accepting new entries" : "Queue is closed — no new entries"}
          </p>
        </div>
        <button
          onClick={() => toggleQueue.mutate(!isOpen)}
          disabled={toggleQueue.isPending}
          className={`relative w-12 h-6 rounded-full transition-colors ${isOpen ? "bg-brand-400" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOpen ? "translate-x-6" : ""}`} />
        </button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
        <p className="text-xs text-gray-400">Queue updates live via Socket.IO</p>
      </div>

      {/* Queue entries */}
      {queueEntries.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No one in the queue right now</p>
        </div>
      ) : (
        <div>
          {queueEntries.map((entry) => (
            <PartyCard
              key={entry._id}
              entry={entry}
              onConfirm={confirmEntry}
              onCall={callCustomer}
              onSeat={seatCustomer}
              onBump={bumpCustomer}
              onNoShow={markNoShow}
              isActing={isActing}
            />
          ))}
        </div>
      )}
    </div>
  );
}