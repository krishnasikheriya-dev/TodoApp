"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type TodoType = {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export default function TodoApp() {
  const queryClient = useQueryClient();
  const [newTodoTitle, setNewTodoTitle] = useState("");

  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery<TodoType[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error("Failed to create todo");
      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Add button clicked!");
    if (!newTodoTitle.trim()) return;

    addMutation.mutate(newTodoTitle);
    setNewTodoTitle(""); // clear the input
  };

  if (isLoading)
    return <div className="text-3xl text-center mt-10">Loading todos...</div>;
  if (error)
    return (
      <div className="text-3xl text-center mt-10 text-red-500">Error loading todos</div>
    );

  return (
    <Card className="max-w-xl mx-auto mt-10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-3 text-center text-2xl">
          <img src="/logo.png" alt="Todo Logo" className="w-8 h-8 rounded" />
          My To-Do List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
        <Input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <Button
          type="submit"
          disabled={!newTodoTitle.trim() || addMutation.isPending}
        >
          Add
        </Button>
      </form>

      <ul className="space-y-3">
        {todos.length > 0 ? (
          todos.map((todo: TodoType) => (
            <li
              key={todo._id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() =>
                    toggleMutation.mutate({
                      id: todo._id,
                      completed: !todo.completed,
                    })
                  }
                  className="h-5 w-5"
                />
                <span
                  className={todo.completed ? "line-through text-gray-500" : ""}
                >
                  {todo.title}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(todo._id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-center">
            No todos yet. Add one above!
          </li>
        )}
      </ul>
      </CardContent>
    </Card>
  );
}
