import React, { useState, useEffect } from 'react';
import { Task, Website } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  websiteId: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  dueDate: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

export default function Tasks() {
  const [data, setData] = useState<Task[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = () => {
    fetch('/api/tasks').then(r => r.json()).then(setData);
    fetch('/api/websites').then(r => r.json()).then(setWebsites);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'Pending',
      priority: 'Medium',
    }
  });

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/tasks/${editingId}` : '/api/tasks';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData, websiteId: formData.websiteId || null}),
      });
      if (res.ok) {
        setOpen(false);
        setEditingId(null);
        reset();
        fetchData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    reset({
      websiteId: task.websiteId || '',
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    reset({
      status: 'Pending',
      priority: 'Medium',
      dueDate: '',
      websiteId: '',
      title: '',
      description: ''
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tasks</h2>
        <Dialog.Root open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditingId(null);
            reset();
          }
        }}>
          <Dialog.Trigger asChild>
            <button onClick={handleAddNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg dark:border-slate-800 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {editingId ? 'Edit Task' : 'Add New Task'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
                  {editingId ? 'Update task details.' : 'Create a new task to track work.'}
                </Dialog.Description>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">Title</label>
                  <input {...register('title')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="e.g., Update caching rules" />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">Description</label>
                  <textarea {...register('description')} className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="Task details..." />
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Website (Optional)</label>
                    <select {...register('websiteId')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800">
                      <option value="">None</option>
                      {websites.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Due Date</label>
                    <input type="date" {...register('dueDate')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Priority</label>
                    <select {...register('priority')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Status</label>
                    <select {...register('status')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800">
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Testing</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md text-sm font-medium transition-colors dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {isLoading ? 'Saving...' : (editingId ? 'Update Task' : 'Save Task')}
                  </button>
                </div>
              </form>
              <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500 dark:ring-offset-slate-950 dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-400">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full shrink-0">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {item.website ? item.website.name : 'General Task'}
                    {item.dueDate && ` • Due ${format(new Date(item.dueDate), 'MMM d, yyyy')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-1 flex items-center text-xs font-semibold rounded-full",
                     item.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                     "bg-amber-100 text-amber-700"
                  )}>
                    {item.status}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full flex items-center">
                    {item.priority}
                  </span>
                  {item.status !== 'Completed' && item.status !== 'Cancelled' && (
                    <button onClick={() => handleEdit(item)} className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
}
