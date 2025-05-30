"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { useRouter } from "next/navigation";

import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import PriorityFolder from "@/components/PriorityFolder";
import Modal from "@/components/Modal";
import Login from "@/components/Auth";

type Task = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  priority: number;
  complete: boolean;
};

// Helper functions for date filtering
function isToday(dateStr: string) {
  const today = new Date();
  const date = new Date(dateStr + "T00:00:00"); // force local midnight
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isThisWeek(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + "T00:00:00");
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= today && date <= endOfWeek;
}

function isOverdue(task: Task) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(task.date + "T00:00:00");
  // Not completed and due before today
  return !task.complete && taskDate < today;
}

function CurrentTime() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-white text-4xl md:text-5xl font-extrabold mb-2 text-center tracking-wider select-none drop-shadow-lg opacity-95">
      {time}
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [todaySubTab, setTodaySubTab] = useState<"all" | "incomplete">("all");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Listen to this user's tasks
        const q = query(collection(db, "users", user.uid, "tasks"));
        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          setTasks(
            snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title ?? "",
                date: data.date ?? "",
                time: data.time,
                location: data.location,
                priority: typeof data.priority === "number" ? data.priority : 1,
                complete: !!data.complete,
              } as Task;
            })
          );
        });
        return () => unsubscribeTasks();
      } else {
        setTasks([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<"today" | "week" | "later">("today");
  const [showModal, setShowModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const overdueTasks = tasks.filter(isOverdue);

  useEffect(() => {
    if (user) {
      const fetchUsername = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || null);
        }
      };
      fetchUsername();
    } else {
      setUsername(null);
    }
  }, [user]);

  // Add Task form state
  const [newTask, setNewTask] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    priority: 1,
  });

  // Complete and clear selected tasks
  const handleCompleteSelected = async () => {
    if (!user) return;
    await Promise.all(
      selectedTasks.map((idx) =>
        updateDoc(doc(db, "users", user.uid, "tasks", tasks[idx].id), {
          complete: true,
          completedAt: new Date().toISOString(),
        })
      )
    );

    setSelectedTasks([]);
  };

  // Add new task handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.date || !user) return;
    if (editIndex !== null) {
      // Edit mode
      const taskToEdit = tasks[editIndex];
      await updateDoc(doc(db, "users", user.uid, "tasks", taskToEdit.id), {
        ...newTask,
      });
      setEditIndex(null);
    } else {
      // Add mode
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        ...newTask,
        complete: false,
        priority: Number(newTask.priority),
      });
    }
    setNewTask({
      title: "",
      date: "",
      time: "",
      location: "",
      priority: 1,
    });
    setShowModal(false);
  };

  // Filter tasks by tab AND exclude completed tasks
  const filteredTasks = tasks.filter((task) => {
    if (task.complete) return false; // Don't show completed tasks
    if (tab === "today") return isToday(task.date);
    if (tab === "week") return isThisWeek(task.date);
    return true;
  });

  // Helper to filter tasks by priority
  const getTasksByPriority = (priority: number) =>
    filteredTasks.filter((task) => task.priority === priority);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <main className="flex flex-col items-center px-2 py-4">
      <CurrentTime />
      <h1 className="text-2xl font-bold mb-4 text-white">
        {username ? `${username}'s Todo List` : "Todo List"}
      </h1>
      <div className="w-full max-w-2xl">
        {/* Tabs */}
        <div className="flex">
          <button
            className={`flex-1 py-2 rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-none text-lg font-semibold border border-b-0 border-[#CC0000] ${
              tab === "today"
                ? "bg-white text-[#CC0000]"
                : "bg-[#CC0000] text-white opacity-50 hover:opacity-80"
            }`}
            onClick={() => setTab("today")}
          >
            Today
          </button>
          <button
            className={`flex-1 py-2 text-lg font-semibold border-t border-b-0 border-[#CC0000] ${
              tab === "week"
                ? "bg-white text-[#CC0000]"
                : "bg-[#CC0000] text-white opacity-50 hover:opacity-80"
            }`}
            onClick={() => setTab("week")}
          >
            This Week
          </button>
          <button
            className={`flex-1 py-2 rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-none text-lg font-semibold border border-b-0 border-[#CC0000] ${
              tab === "later"
                ? "bg-white text-[#CC0000]"
                : "bg-[#CC0000] text-white opacity-50 hover:opacity-80"
            }`}
            onClick={() => setTab("later")}
          >
            Later
          </button>
        </div>
        {/* Red container */}
        <div
          className="bg-[#CC0000] rounded-b-lg pt-8 p-4 shadow-lg flex flex-col gap-6 relative"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {tab === "today" && overdueTasks.length > 0 && (
            <PriorityFolder
              label="Overdue"
              priority={-1}
              tasks={overdueTasks}
              selectedTasks={selectedTasks}
              setSelectedTasks={setSelectedTasks}
              allTasks={tasks}
              onEdit={(index) => {
                setEditIndex(
                  tasks.findIndex((t) => t.id === overdueTasks[index].id)
                );
                setNewTask({
                  title: overdueTasks[index].title,
                  date: overdueTasks[index].date,
                  time: overdueTasks[index].time ?? "",
                  location: overdueTasks[index].location ?? "",
                  priority: overdueTasks[index].priority,
                });
                setShowModal(true);
              }}
              onDelete={(index) => {
                setDeleteIndex(
                  tasks.findIndex((t) => t.id === overdueTasks[index].id)
                );
                setShowDeleteModal(true);
              }}
            />
          )}

          <PriorityFolder
            label="High Priority"
            priority={1}
            tasks={getTasksByPriority(1)}
            allTasks={tasks}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            onEdit={(index) => {
              setEditIndex(index);
              setNewTask({
                title: tasks[index].title,
                date: tasks[index].date,
                time: tasks[index].time ?? "",
                location: tasks[index].location ?? "",
                priority: tasks[index].priority,
              });
              setShowModal(true);
            }}
            onDelete={(index) => {
              setDeleteIndex(index);
              setShowDeleteModal(true);
            }}
          />
          <PriorityFolder
            label="Medium Priority"
            priority={2}
            tasks={getTasksByPriority(2)}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            allTasks={tasks}
            onEdit={(index) => {
              setEditIndex(index);
              setNewTask({
                title: tasks[index].title,
                date: tasks[index].date,
                time: tasks[index].time ?? "",
                location: tasks[index].location ?? "",
                priority: tasks[index].priority,
              });
              setShowModal(true);
            }}
            onDelete={(index) => {
              setDeleteIndex(index);
              setShowDeleteModal(true);
            }}
          />
          <PriorityFolder
            label="Low Priority"
            priority={3}
            tasks={getTasksByPriority(3)}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            allTasks={tasks}
            onEdit={(index) => {
              setEditIndex(index);
              setNewTask({
                title: tasks[index].title,
                date: tasks[index].date,
                time: tasks[index].time ?? "",
                location: tasks[index].location ?? "",
                priority: tasks[index].priority,
              });
              setShowModal(true);
            }}
            onDelete={(index) => {
              setDeleteIndex(index);
              setShowDeleteModal(true);
            }}
          />
          {/* Modal */}
          {showModal && (
            <Modal
              open={showModal}
              onClose={() => {
                setShowModal(false);
                setEditIndex(null);
              }}
            >
              <h2 className="text-xl font-bold mb-4 text-[#CC0000]">
                {editIndex !== null ? "Editing Task" : "Add New Task"}
              </h2>
              <form
                onSubmit={handleAddTask}
                className="flex flex-col gap-3 text-black"
              >
                <input
                  type="text"
                  placeholder="Task title"
                  className="px-2 py-1 rounded border border-[#CC0000] focus:outline-none text-black"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  required
                />
                <input
                  type="date"
                  className="px-2 py-1 rounded border border-[#CC0000] focus:outline-none text-black"
                  value={newTask.date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, date: e.target.value })
                  }
                  required
                />
                <input
                  type="time"
                  className="px-2 py-1 rounded border border-[#CC0000] focus:outline-none text-black"
                  value={newTask.time}
                  onChange={(e) =>
                    setNewTask({ ...newTask, time: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="px-2 py-1 rounded border border-[#CC0000] focus:outline-none text-black"
                  value={newTask.location}
                  onChange={(e) =>
                    setNewTask({ ...newTask, location: e.target.value })
                  }
                />
                <select
                  className="px-2 py-1 rounded border border-[#CC0000] focus:outline-none text-black"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
                <button
                  type="submit"
                  className="bg-[#CC0000] text-white px-4 py-2 rounded font-bold hover:bg-[#a30000] transition mt-2"
                >
                  {editIndex !== null ? "Confirm Edits" : "Add Task"}
                </button>
              </form>
            </Modal>
          )}
          {showDeleteModal && (
            <Modal
              open={showDeleteModal}
              onClose={() => {
                setShowDeleteModal(false);
                setDeleteIndex(null);
              }}
            >
              <h2 className="text-xl font-bold mb-4 text-[#CC0000]">
                Confirm Delete
              </h2>
              <p className="mb-6">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-black font-bold"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteIndex(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white font-bold"
                  onClick={async () => {
                    if (deleteIndex !== null && user) {
                      const taskToDelete = tasks[deleteIndex];
                      await deleteDoc(
                        doc(db, "users", user.uid, "tasks", taskToDelete.id)
                      );
                    }
                    setShowDeleteModal(false);
                    setDeleteIndex(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </Modal>
          )}
        </div>
        {selectedTasks.length === 0 ? (
          <button
            className="w-full mt-4 bg-white text-[#CC0000] font-bold py-3 rounded-lg shadow hover:bg-gray-100 transition text-lg"
            onClick={() => setShowModal(true)}
          >
            + Add Task
          </button>
        ) : (
          <button
            className="w-full mt-4 bg-[#CC0000] text-white font-bold py-3 rounded-lg shadow hover:bg-[#a30000] transition text-lg"
            onClick={handleCompleteSelected}
          >
            Complete & Clear Selected ({selectedTasks.length})
          </button>
        )}
      </div>
    </main>
  );
}
