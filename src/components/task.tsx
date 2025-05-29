import React from "react";

interface TaskProps {
  title: string;
  date: string;
  time?: string;
  location?: string;
  priority: number;
  complete: boolean;
  onToggle: () => void;
}

// Helper to convert "HH:mm" to "h:mm AM/PM"
function formatTime(time?: string) {
  if (!time) return "";
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}
// ...existing code...

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 1:
      return "High";
    case 2:
      return "Medium";
    case 3:
      return "Low";
    default:
      return "Unknown";
  }
};

const Task: React.FC<TaskProps> = ({
  title,
  date,
  time,
  location,
  complete,
  onToggle,
}) => {
  // NC State Red: #CC0000, White: #FFFFFF, Black: #000000
  return (
    <div
      className="flex items-center gap-4 p-4 rounded shadow border w-full max-w-2xl"
      style={{
        backgroundColor: "#fff",
        borderColor: "#CC0000",
      }}
    >
      <input
        type="checkbox"
        checked={complete}
        onChange={onToggle}
        className="h-5 w-5 accent-[#CC0000] border-black"
      />
      <div className="flex flex-col flex-1">
        <span
          className={`font-semibold text-lg ${
            complete ? "line-through text-gray-400" : "text-[#CC0000]"
          }`}
        >
          {title}
        </span>
        <span className="text-sm text-black">
          Due: {date}
          {time && ` at ${formatTime(time)}`}
        </span>
        {location && (
          <span className="text-xs text-black">Location: {location}</span>
        )}
      </div>
    </div>
  );
};

export default Task;
