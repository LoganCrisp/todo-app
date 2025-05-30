import React from "react";

interface TaskProps {
  title: string;
  date: string;
  time?: string;
  location?: string;
  priority: number;
  complete: boolean;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

const Task: React.FC<TaskProps> = ({
  title,
  date,
  time,
  location,
  complete,
  selected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded shadow border w-full max-w-2xl"
      style={{
        backgroundColor: "#fff",
        borderColor: "#CC0000",
        opacity: complete ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="h-5 w-5 accent-[#CC0000] border-black"
        aria-label="Select Task"
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
      {onEdit && (
        <button
          className="ml-2 text-[#CC0000] hover:underline text-sm font-bold"
          onClick={onEdit}
          aria-label="Edit Task"
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          className="ml-2 text-red-600 hover:underline text-sm font-bold"
          onClick={onDelete}
          aria-label="Delete Task"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default Task;
