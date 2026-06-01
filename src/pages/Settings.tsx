import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleExport = () => {
    window.location.href = '/api/export';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
        
        {/* Appearance Settings */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Theme Preference</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Switch between light and dark mode.</p>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                "relative inline-flex h-10 items-center justify-center rounded-lg p-1 text-sm font-medium transition-colors",
                "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition-all",
                  theme === 'light' ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-200"
                )}
              >
                <Sun className="w-4 h-4" />
              </div>
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition-all ml-1",
                  theme === 'dark' ? "bg-slate-700 text-white shadow-sm" : "hover:text-slate-900"
                )}
              >
                <Moon className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Data Settings */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Data Management</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Export All Data</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Download a JSON file containing all your websites, changes, tasks, issues, and logs.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
