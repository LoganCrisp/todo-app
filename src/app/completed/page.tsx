"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Task from "@/components/Task";
import Login from "@/components/Auth";

// Helper to format date nicely
function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// How many days to keep completed tasks
const AUTO_DELETE_AFTER_DAYS = 7;

type TaskType = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  priority: number;
  complete: boolean;
  completedAt?: string; // ISO date string
};

export default function Completed() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
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
                completedAt: data.completedAt ?? null,
              } as TaskType;
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

  // Auto-delete tasks that have been completed for more than 7 days
  useEffect(() => {
    if (!user) return;
    const now = new Date();
    tasks.forEach(async (task) => {
      if (task.complete && task.completedAt) {
        const completedAtDate = new Date(task.completedAt);
        const diffDays =
          (now.getTime() - completedAtDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > AUTO_DELETE_AFTER_DAYS) {
          await deleteDoc(doc(db, "users", user.uid, "tasks", task.id));
        }
      }
    });
  }, [tasks, user]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }
  if (!user) {
    return <Login />;
  }

  // Group completed tasks by date
  const completedTasks = tasks.filter((t) => t.complete && t.date);
  const groupedByDate: { [date: string]: TaskType[] } = {};
  completedTasks.forEach((task) => {
    if (!groupedByDate[task.date]) groupedByDate[task.date] = [];
    groupedByDate[task.date].push(task);
  });

  // Sort dates descending (most recent first)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  // Recover a task (set complete to false, remove completedAt)
  const handleRecover = async (task: TaskType) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "tasks", task.id), {
      complete: false,
      completedAt: null,
    });
  };

  // Delete a task
  const handleDelete = async (task: TaskType) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", task.id));
  };

  return (
    <main className="flex flex-col items-center px-2 py-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Completed Tasks</h1>
      <div className="w-full max-w-2xl">
        {sortedDates.length === 0 ? (
          <div className="text-white text-center mt-10">
            No completed tasks found.
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="mb-8">
              <div className="bg-white text-[#CC0000] px-4 py-2 rounded-t-lg font-bold text-lg border border-b-0 border-[#CC0000] shadow">
                {formatDate(date)}
              </div>
              <div className="flex flex-col gap-2 bg-white/90 rounded-b-lg border border-[#CC0000] shadow-inner p-4">
                {groupedByDate[date]
                  .sort((a, b) => {
                    if (a.time && b.time) return a.time.localeCompare(b.time);
                    return 0;
                  })
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <Task {...task} selected={false} onSelect={() => {}} />
                      <button
                        onClick={() => handleRecover(task)}
                        className="bg-green-600 text-white px-2 py-1 rounded font-bold hover:bg-green-700 text-xs"
                      >
                        Recover
                      </button>
                      <button
                        onClick={() => handleDelete(task)}
                        className="bg-red-600 text-white px-2 py-1 rounded font-bold hover:bg-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
