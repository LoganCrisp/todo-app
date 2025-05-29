"use client";

import React, { useState } from "react";
import Task from "@/components/task";

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
  const date = new Date(dateStr);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);
  return date >= today && date <= endOfWeek;
}

export default function Home() {
  const [tasks, setTasks] = useState([
    {
      title: "Buy groceries",
      date: "2025-05-29",
      time: "23:58",
      location: "Supermarket",
      priority: 1,
      complete: false,
    },
    {
      title: "Finish project report",
      date: "2025-05-31",
      priority: 1,
      complete: false,
    },
    {
      title: "Call Alice",
      date: "2025-06-01",
      time: "14:00",
      priority: 3,
      complete: false,
    },
    {
      title: "Read textbook chapter",
      date: "2025-06-02",
      time: "20:00",
      priority: 2,
      complete: false,
    },
    {
      title: "Team meeting",
      date: "2025-06-03",
      time: "10:00",
      location: "Library",
      priority: 1,
      complete: false,
    },
    {
      title: "Submit assignment",
      date: "2025-06-04",
      time: "23:59",
      priority: 1,
      complete: false,
    },
    {
      title: "Laundry",
      date: "2025-06-05",
      priority: 3,
      complete: false,
    },
    {
      title: "Workout",
      date: "2025-06-06",
      time: "18:00",
      priority: 2,
      complete: false,
    },
    {
      title: "Dentist appointment",
      date: "2025-06-07",
      time: "09:00",
      priority: 1,
      complete: false,
    },
    {
      title: "Plan weekend trip",
      date: "2025-06-08",
      priority: 3,
      complete: false,
    },
  ]);

  const [tab, setTab] = useState<"today" | "week" | "later">("today");

  const toggleTask = (index: number) => {
    setTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, complete: !task.complete } : task
      )
    );
  };

  // Filter tasks by tab
  const filteredTasks = tasks.filter((task) => {
    if (tab === "today") {
      return isToday(task.date);
    }
    if (tab === "week") {
      return isThisWeek(task.date);
    }
    return true; // "later" tab shows all tasks
  });

  // Helper to filter tasks by priority
  const getTasksByPriority = (priority: number) =>
    filteredTasks
      .map((task, idx) => ({ ...task, idx: tasks.indexOf(task) }))
      .filter((task) => task.priority === priority);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#222326]">
      <h1 className="text-2xl font-bold mb-4 text-white">Todo List</h1>
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
          className="bg-[#CC0000] rounded-b-lg pt-8 p-4 shadow-lg flex flex-col gap-6"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {/* High Priority Folder */}
          <div className="relative mb-2">
            {/* Folder Tab */}
            <div className="absolute -top-5  left-0 bg-white text-[#CC0000] font-bold px-6 py-1 rounded-t-lg border border-b-0 border-[#CC0000] shadow z-10">
              High Priority
            </div>
            {/* Folder Body */}
            <div className="pt-6 bg-white/90 rounded-lg border border-[#CC0000] shadow-inner min-h-[60px]">
              <div className="flex flex-col gap-2 p-4">
                {getTasksByPriority(1).length === 0 ? (
                  <span className="text-[#CC0000]/70 text-sm">
                    No high priority tasks
                  </span>
                ) : (
                  getTasksByPriority(1).map((task) => (
                    <Task
                      key={task.idx}
                      {...task}
                      onToggle={() => toggleTask(task.idx)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Medium Priority Folder */}
          <div className="relative mb-2">
            <div className="absolute -top-5 left-0 bg-white text-[#CC0000] font-bold px-6 py-1 rounded-t-lg border border-b-0 border-[#CC0000] shadow z-10">
              Medium Priority
            </div>
            <div className="pt-6 bg-white/90 rounded-lg border border-[#CC0000] shadow-inner min-h-[60px]">
              <div className="flex flex-col gap-2 p-4">
                {getTasksByPriority(2).length === 0 ? (
                  <span className="text-[#CC0000]/70 text-sm">
                    No medium priority tasks
                  </span>
                ) : (
                  getTasksByPriority(2).map((task) => (
                    <Task
                      key={task.idx}
                      {...task}
                      onToggle={() => toggleTask(task.idx)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Low Priority Folder */}
          <div className="relative">
            <div className="absolute -top-5 left-0 bg-white text-[#CC0000] font-bold px-6 py-1 rounded-t-lg border border-b-0 border-[#CC0000] shadow z-10">
              Low Priority
            </div>
            <div className="pt-6 bg-white/90 rounded-lg border border-[#CC0000] shadow-inner min-h-[60px]">
              <div className="flex flex-col gap-2 p-4">
                {getTasksByPriority(3).length === 0 ? (
                  <span className="text-[#CC0000]/70 text-sm">
                    No low priority tasks
                  </span>
                ) : (
                  getTasksByPriority(3).map((task) => (
                    <Task
                      key={task.idx}
                      {...task}
                      onToggle={() => toggleTask(task.idx)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
