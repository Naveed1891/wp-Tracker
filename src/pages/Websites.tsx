import React, { useState, useEffect } from 'react';
import { Website } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, ExternalLink, Archive } from 'lucide-react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const websiteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  hostingProvider: z.string().optional(),
  serverDetails: z.string().optional(),
  wpVersion: z.string().optional(),
  phpVersion: z.string().optional(),
});

type WebsiteFormData = z.infer<typeof websiteSchema>;

export default function Websites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWebsites = () => {
    fetch('/api/websites')
      .then(r => r.json())
      .then(setWebsites);
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema)
  });

  const onSubmit = async (data: WebsiteFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        fetchWebsites();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Websites</h2>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Website
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Add New Website</Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400">
                  Enter the details of the WordPress website you want to track.
                </Dialog.Description>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none">Name</label>
                  <input id="name" {...register('name')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="My Awesome Blog" />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="url" className="text-sm font-medium leading-none">URL</label>
                  <input id="url" {...register('url')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="https://example.com" />
                  {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">Hosting Provider</label>
                    <input {...register('hostingProvider')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none">WP Version</label>
                    <input {...register('wpVersion')} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800" placeholder="6.4.3" />
                  </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md text-sm font-medium transition-colors dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Website'}
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

      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Name</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Hosting</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">WP Version</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {websites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{site.name}</div>
                  <a href={site.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mt-1">
                    {site.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", site.status === 'active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400")}>
                    {site.status === 'active' ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{site.hostingProvider || '-'}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{site.wpVersion || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2" title="Archive">
                    <Archive className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {websites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No websites found. Add one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
