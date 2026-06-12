import React from 'react';

interface SourceBadgeProps {
  sources: string[];
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documenti consultati:</p>
      <div className="flex flex-col gap-2">
        {sources.map((source, index) => (
          <div key={index} className="text-xs bg-blue-50 text-blue-800 p-2 rounded border border-blue-100 italic">
            "{source.trim()}"
          </div>
        ))}
      </div>
    </div>
  );
};