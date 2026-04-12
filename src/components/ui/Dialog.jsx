import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full animate-in zoom-in-95 duration-300">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className, children }) => (
  <div className={cn(
    "mx-auto p-8 rounded-2xl shadow-2xl relative overflow-hidden",
    "glass-panel border-white/10 bg-[#0a0f1e]/90",
    className
  )}>
    {children}
  </div>
);

export const DialogHeader = ({ className, children }) => (
  <div className={cn("space-y-1.5 mb-6", className)}>
    {children}
  </div>
);

export const DialogTitle = ({ className, children }) => (
  <h2 className={cn("text-2xl font-black text-white tracking-tight leading-none", className)}>
    {children}
  </h2>
);

export const DialogDescription = ({ className, children }) => (
  <p className={cn("text-sm text-muted-foreground font-medium", className)}>
    {children}
  </p>
);
