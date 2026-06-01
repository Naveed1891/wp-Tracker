import React, { useState, useEffect } from 'react';
import { ChangeLog, Website } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const changeSchema = z.object({
  websiteId: z.string().min(1, "Website is required"),
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  changeType: z.string().min(1, "Type is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
});

type ChangeFormData = z.infer<typeof changeSchema>;

export default function Changes() {
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = () => {
    fetch('/api/changes').then(r => r.json()).then(setChanges);
    fetch('/api/websites').then(r => r.json()).then(setWebsites);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangeFormData>({
    resolver: zodResolver(changeSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      priority: 'Medium',
      changeType: 'Plugin Update'
    }
  });

  const onSubmit = async (data: ChangeFormData) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/changes/${editingId}` : '/api/changes';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  const handleEdit = (change: ChangeLog) => {
    setEditingId(change.id);
    reset({
      websiteId: change.websiteId,
      date: change.date.split('T')[0],
      title: change.title,
      description: change.description,
      changeType: change.changeType,
      priority: change.priority,
      status: change.status,
    });
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    reset({
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      priority: 'Medium',
      changeType: 'Plugin Update'
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Change Log</h2>
        <Dialog.Root open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditingId(null);
            reset();
          }
        }}>
          <Dialog.Trigger asChild>
            <button onClick={handleAddNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Log Change
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg dark:border-slate-800 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {editingId ? 'Edit Website Change' : 'Log Website Change'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
                  {editingId ? 'Update the details of this change.' : 'Record an update, bug fix, or maintenance task.'}
                </Dialog.Description>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Website</label>
                    <select {...register('websiteId')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800">
                      <option value="">Select a website...</option>
                      {websites.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    {errors.websiteId && <p className="text-sm text-red-500">{errors.websiteId.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Date</label>
                    <input type="date" {...register('date')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" />
                    {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">Title</label>
                  <input {...register('title')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="e.g., Updated WooCommerce to 8.5.1" />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">Description</label>
                  <textarea {...register('description')} className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="Details of what was changed..." />
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Type</label>
                    <select {...register('changeType')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800">
                      <option>Plugin Update</option>
                      <option>Theme Update</option>
                      <option>Core Update</option>
                      <option>Bug Fix</option>
                      <option>Security Fix</option>
                      <option>Content Update</option>
                      <option>Other</option>
                    </select>
                  </div>
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
                      <option>Planned</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Reverted</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md text-sm font-medium transition-colors dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {isLoading ? 'Saving...' : (editingId ? 'Update Change' : 'Save Change')}
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
        {changes.map((change) => (
          <div key={change.id} className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{change.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {change.website?.name || 'Unknown Website'} &middot; {format(new Date(change.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-1 flex items-center text-xs font-semibold rounded-full",
                     change.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                     change.status === 'Reverted' ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {change.status}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full flex items-center">
                    {change.changeType}
                  </span>
                  {change.status !== 'Completed' && change.status !== 'Reverted' && (
                    <button onClick={() => handleEdit(change)} className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {change.description}
              </p>
            </div>
          </div>
        ))}
        {changes.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            No changes logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
