import React, { useState } from 'react';
import { X, Download, Copy, Check, Code2, Sparkles } from 'lucide-react';

interface ExportStandaloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const ExportStandaloneModal: React.FC<ExportStandaloneModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'sql' | 'html' | 'css' | 'js'>('guide');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;
  const isBn = lang === 'bn';

  const downloadFile = async (fileName: string, relativePath: string) => {
    try {
      const response = await fetch(relativePath);
      const content = await response.text();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download file', err);
    }
  };

  const handleCopyCode = async (relativePath: string, key: string) => {
    try {
      const response = await fetch(relativePath);
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBn ? 'GitHub ও Vercel হোস্ট করার জন্য Standalone ফাইলসমূহ' : 'Standalone Files for GitHub & Vercel'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isBn ? 'HTML, CSS, JavaScript ও Supabase SQL ফাইল' : 'Pure HTML, CSS, Vanilla JS & Supabase SQL'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          {[
            { id: 'guide', label: isBn ? 'হোস্টিং গাইড' : 'Deployment Guide' },
            { id: 'sql', label: 'supabase_schema.sql' },
            { id: 'html', label: 'index.html' },
            { id: 'css', label: 'style.css' },
            { id: 'js', label: 'app.js' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-[15px] text-slate-700 dark:text-slate-200 space-y-4">
          {activeTab === 'guide' && (
            <div className="space-y-5">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 text-base">
                      {isBn ? 'এক ক্লিকে ফাইলসমূহ ডাউনলোড করুন:' : 'Download Standalone Files:'}
                    </span>
                  </div>
                  <span className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                    {isBn ? 'Supabase সংযুক্ত' : 'Supabase Ready'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { name: 'index.html', path: '/standalone/index.html' },
                    { name: 'style.css', path: '/standalone/style.css' },
                    { name: 'app.js', path: '/standalone/app.js' },
                    { name: 'supabase_schema.sql', path: '/standalone/supabase_schema.sql' },
                    { name: 'README.md', path: '/standalone/README.md' },
                  ].map((f) => (
                    <button
                      key={f.name}
                      onClick={() => downloadFile(f.name, f.path)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100/60 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-800/50">
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">0</span>
                  {isBn ? 'Supabase ডাটাবেজ সেটআপ (প্রথমবার)' : 'Supabase Database Setup (One-time)'}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 pl-1">
                  <li>আপনার Supabase প্রোজেক্টের <strong>SQL Editor</strong> &gt; <strong>New Query</strong>-তে যান।</li>
                  <li><code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">supabase_schema.sql</code> ফাইলের কোড কপি করে Run করুন। এটি <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">products</code> এবং <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">sales</code> টেবিল তৈরি করবে।</li>
                  <li>এরপর পেজ রিফ্রেশ করলেই ২৯টি পণ্য স্বয়ংক্রিয়ভাবে ডাটাবেজে সেভ হয়ে যাবে।</li>
                </ol>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-800/50">
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs flex items-center justify-center font-mono">1</span>
                  {isBn ? 'GitHub Pages ও Vercel-এ হোস্ট করার নিয়ম' : 'Host on GitHub Pages & Vercel'}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 pl-1">
                  <li>GitHub-এ নতুন রিপোজিটরি তৈরি করে ডাউনলোড করা ফাইলগুলো আপলোড করুন।</li>
                  <li>GitHub <strong>Settings &gt; Pages</strong> অথবা <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 font-semibold underline">vercel.com</a>-এ স্ট্যাটিক সাইট হিসেবে Deploy চাপুন।</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab !== 'guide' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono text-slate-600 dark:text-slate-300">
                  standalone/{activeTab === 'sql' ? 'supabase_schema.sql' : activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'app.js'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleCopyCode(
                        `/standalone/${activeTab === 'sql' ? 'supabase_schema.sql' : activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'app.js'}`,
                        activeTab
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    {copied === activeTab ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied === activeTab ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কোড কপি করুন' : 'Copy Code')}
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(
                        activeTab === 'sql' ? 'supabase_schema.sql' : activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'app.js',
                        `/standalone/${activeTab === 'sql' ? 'supabase_schema.sql' : activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'app.js'}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {isBn ? 'ডাউনলোড' : 'Download'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeTab === 'sql'
                  ? isBn
                    ? 'আপনার Supabase Dashboard > SQL Editor-এ গিয়ে এই SQL কোডটি রান করলে products ও sales টেবিল তৈরি হয়ে যাবে।'
                    : 'Run this SQL script inside Supabase Dashboard > SQL Editor to create products and sales tables.'
                  : isBn
                  ? 'নতুন ডার্ক/লাইট থিম, ১০ জন গ্রাহকের অবতার গ্রিড ও ক্যাটাগরিভিত্তিক পণ্যের কার্ডসহ সম্পূর্ণ আপডেটেড ফাইল।'
                  : 'Updated standalone file with Dark/Light mode, 10 customer avatars, category product grid, and Supabase sync.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
            /standalone/ (index.html, style.css, app.js, supabase_schema.sql)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isBn ? 'ঠিক আছে' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
