import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 animate-pulse">
      {/* Title Placeholder */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
      
      {/* Badge Placeholder */}
      <div className="h-5 bg-slate-200 rounded w-16 mb-4"></div>

      {/* Footer Divider */}
      <div className="border-t border-slate-100 pt-3 space-y-2.5">
        {/* Due Date Line */}
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
           <div className="h-3 bg-slate-200 rounded w-24"></div>
        </div>

        {/* Created At Line */}
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
           <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>

        {/* Updated At Line */}
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
           <div className="h-3 bg-slate-200 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
}