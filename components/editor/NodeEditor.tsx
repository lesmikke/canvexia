import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Sparkles, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialContent: string;
  onSave: (newContent: string) => void;
}

export function NodeEditor({ isOpen, onClose, title, initialContent, onSave }: NodeEditorProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onSave(html);
    },
  });

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      if (editor.getHTML() !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  // --- AI HANDLER ---
  const handleAiAction = async (command: string) => {
    if (!editor) return;

    // Get the current text
    const currentText = editor.getHTML();
    
    // Optimistic UI: Show loading state
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentText,
          command: command,
        }),
      });

      const data = await response.json();

      if (data.result) {
        // Replace content with AI result
        editor.commands.setContent(data.result);
        onSave(data.result);
      }
    } catch (error) {
      console.error("AI Failed", error);
      alert("AI failed to generate. Check your console/API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {title}
          </DialogTitle>
          
          {/* AI TOOLBAR */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                {isAiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                AI Magic
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAiAction("Fix grammar and spelling")}>
                Fix Grammar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAiAction("Summarize this in bullet points")}>
                Summarize
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAiAction("Expand on this idea and make it longer")}>
                Expand Idea
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-slate-50 rounded-md border border-slate-100 mt-2">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}