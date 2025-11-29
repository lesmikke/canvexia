import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from "@/components/ui/card";

// We define what data we expect this node to store (just a label for now)
type TextNodeData = {
  label: string;
};

// using 'memo' is a performance trick so React doesn't re-render 
// the node unless its data actually changes.
export const TextNode = memo(({ data, selected }: NodeProps<TextNodeData>) => {
  return (
    <>
      {/* Target Handle: Connectors where lines (edges) enter this node */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 !bg-slate-400" 
      />

      {/* The visible card content */}
      <Card className={`min-w-[200px] shadow-sm transition-all duration-200 ${selected ? 'ring-2 ring-blue-500 shadow-md' : 'border-slate-200'}`}>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-slate-900">
            {data.label || "Empty Node"}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Double click to edit
          </div>
        </CardContent>
      </Card>

      {/* Source Handle: Connectors where lines leave this node */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-slate-400" 
      />
    </>
  );
});

TextNode.displayName = "TextNode";