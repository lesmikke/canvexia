import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from "@/components/ui/card";

// We keep the component generic to satisfy the build system
export const TextNode = memo(({ data, selected }: NodeProps) => {
  return (
    <>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 !bg-slate-400" 
      />

      <Card className={`min-w-[200px] shadow-sm transition-all duration-200 ${selected ? 'ring-2 ring-blue-500 shadow-md' : 'border-slate-200'}`}>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-slate-900">
            {/* We safely access the label, defaulting to "Empty" if missing */}
            {typeof data.label === 'string' ? data.label : "Empty Node"}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Double click to edit
          </div>
        </CardContent>
      </Card>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-slate-400" 
      />
    </>
  );
});

TextNode.displayName = "TextNode";