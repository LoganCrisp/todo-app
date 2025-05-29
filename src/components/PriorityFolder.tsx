import Task from "./Task";

interface TaskType {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  priority: number;
  complete: boolean;
}

interface PriorityFolderProps {
  label: string;
  priority: number;
  tasks: TaskType[];
  onToggle: (index: number) => void;
  allTasks: TaskType[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

const PriorityFolder: React.FC<PriorityFolderProps> = ({
  label,
  // priority, // Removed since unused
  tasks,
  onToggle,
  allTasks,
  onEdit,
  onDelete,
}) => (
  <div className="relative mb-2">
    <div className="absolute -top-5 left-0 bg-white text-[#CC0000] font-bold px-6 py-1 rounded-t-lg border border-b-0 border-[#CC0000] shadow z-10">
      {label}
    </div>
    <div className="pt-6 bg-white/90 rounded-lg border border-[#CC0000] shadow-inner min-h-[60px]">
      <div className="flex flex-col gap-2 p-4">
        {tasks.length === 0 ? (
          <span className="text-[#CC0000]/70 text-sm">
            No {label.toLowerCase()} tasks
          </span>
        ) : (
          tasks.map((task) => {
            const globalIndex = allTasks.indexOf(task);
            return (
              <Task
                key={task.id}
                {...task}
                onToggle={() => onToggle(globalIndex)}
                onEdit={onEdit ? () => onEdit(globalIndex) : undefined}
                onDelete={onDelete ? () => onDelete(globalIndex) : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  </div>
);

export default PriorityFolder;
