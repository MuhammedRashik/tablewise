import Badge from "../ui/Badge";

const STATUS_COLORS = {
  waiting:   "gray",
  confirmed: "blue",
  called:    "green",
};

const QueueRow = ({ entry, isMe = false }) => (
  <div className={`flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 ${isMe ? "bg-brand-50 -mx-4 px-4 rounded-lg" : ""}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${isMe ? "bg-brand-400 text-white" : "bg-gray-100 text-gray-600"}`}>
      {entry.position}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium truncate ${isMe ? "text-brand-800" : "text-gray-800"}`}>
        {isMe ? "You" : entry.customerName.split(" ")[0]}
      </p>
      <p className="text-xs text-gray-400">{entry.partySize} {entry.partySize === 1 ? "person" : "people"}</p>
    </div>
    <Badge variant={STATUS_COLORS[entry.status] || "gray"}>
      {entry.status}
    </Badge>
  </div>
);
export default QueueRow;