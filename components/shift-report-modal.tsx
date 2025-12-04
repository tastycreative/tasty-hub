"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Send, Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: string) => Promise<void>;
  clockOutTime?: string;
  duration?: number; // in minutes
  timezone?: string;
}

// Simple markdown preview (basic formatting)
function MarkdownPreview({ content }: { content: string }) {
  // Basic markdown to HTML conversion
  const formatMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-2 rounded-md my-2 overflow-x-auto"><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Unordered lists
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-3 border rounded-md bg-muted/30"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) || '<span class="text-muted-foreground">Nothing to preview</span>' }}
    />
  );
}

function formatDurationHM(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function ShiftReportModal({
  isOpen,
  onClose,
  onSubmit,
  clockOutTime,
  duration,
  timezone = "America/Los_Angeles",
}: ShiftReportModalProps) {
  const [report, setReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleSubmit = async () => {
    if (!report.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(report);
      setReport("");
      onClose();
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setReport("");
    onClose();
  };

  // Template for quick start
  const insertTemplate = () => {
    const template = `## Shift Summary

### Tasks Completed
- 

### In Progress
- 

### Blockers/Issues
- 

### Notes
`;
    setReport(template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Shift Report
          </DialogTitle>
          <DialogDescription>
            Submit your shift report for today.{duration !== undefined && (
              <> You worked{" "}
              <span className="font-semibold text-foreground">{formatDurationHM(duration)}</span>.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Toggle between edit and preview */}
          <div className="flex items-center justify-between">
            <Label htmlFor="report">Report (Markdown supported)</Label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={!isPreview ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIsPreview(false)}
                className="h-7 px-2"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                type="button"
                variant={isPreview ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIsPreview(true)}
                className="h-7 px-2"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* Editor or Preview */}
          {isPreview ? (
            <MarkdownPreview content={report} />
          ) : (
            <Textarea
              id="report"
              placeholder="Write your shift report here...

## What I worked on
- 

## Issues encountered
- 

## Tomorrow's plan
- "
              value={report}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          )}

          {/* Quick actions */}
          {!isPreview && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Quick:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={insertTemplate}
                className="h-6 text-xs"
              >
                Insert Template
              </Button>
            </div>
          )}

          {/* Markdown tips */}
          {!isPreview && (
            <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/50 rounded-md">
              <p className="font-medium">Markdown tips:</p>
              <p><code className="bg-muted px-1"># Heading</code> • <code className="bg-muted px-1">**bold**</code> • <code className="bg-muted px-1">*italic*</code> • <code className="bg-muted px-1">- list item</code> • <code className="bg-muted px-1">`code`</code></p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip for now
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !report.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
