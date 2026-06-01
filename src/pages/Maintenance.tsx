import React, { useState, useEffect } from 'react';
import { Website } from '../types';
import { MaintenanceLog } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const formSchema = z.object({
  websiteId: z.string().min(1, "Website is required"),
  date: z.string().min(1, "Date is required"),
  activity: z.string().min(1, "Activity is required"),
  details: z.string().min(1, "Details are required"),
  timeSpent: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  outcome: z.string().min(1, "Outcome is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function Maintenance() {
  const [data, setData] = useState<MaintenanceLog[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    fetch('/api/maintenance').then(r => r.json()).then(setData);
    fetch('/api/websites').then(r => r.json()).then(setWebsites);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      outcome: 'Success',
    }
  });

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        fetchData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Maintenance Logs</h2>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Log Maintenance
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg dark:border-slate-800 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Log Maintenance Activity</Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
                  Record daily maintenance activities for a website.
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
                  <label className="text-sm font-medium leading-none">Activity</label>
                  <input {...register('activity')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="e.g., Weekly Backup & Plugin Updates" />
                  {errors.activity && <p className="text-sm text-red-500">{errors.activity.message}</p>}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">Details</label>
                  <textarea {...register('details')} className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="Activity details..." />
                  {errors.details && <p className="text-sm text-red-500">{errors.details.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Time Spent (minutes)</label>
                    <input type="number" {...register('timeSpent')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="e.g., 45" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Outcome</label>
                    <input {...register('outcome')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="e.g., Success, Failed" />
                    {errors.outcome && <p className="text-sm text-red-500">{errors.outcome.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md text-sm font-medium transition-colors dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Log'}
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
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.activity}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {item.website?.name || 'Unknown Website'} • {format(new Date(item.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-1 flex items-center text-xs font-semibold rounded-full",
                     item.outcome.toLowerCase() === 'success' ? "bg-emerald-100 text-emerald-700" :
                     "bg-slate-100 text-slate-700"
                  )}>
                    {item.outcome}
                  </span>
                  {item.timeSpent && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full flex items-center">
                      {item.timeSpent} mins
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {item.details}
              </p>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            No maintenance logs found.
          </div>
        )}
      </div>
    </div>
  );
}
