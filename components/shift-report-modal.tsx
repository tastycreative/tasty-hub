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
import { FileText, Send } from "lucide-react";
import { DateTime } from "luxon";

interface ShiftReportModalProps {
  isOpen: boolean;
  onSubmit: (report: string) => Promise<void>;
  clockOutTime?: string;
  totalHours?: number; // Net work hours (already calculated)
  totalBreak?: number; // Total break time in minutes
  timezone?: string;
  isSubmitting?: boolean;
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`;
  } else if (h > 0) {
    return `${h}h`;
  }
  return `${m}m`;
}

export function ShiftReportModal({
  isOpen,
  onSubmit,
  clockOutTime,
  totalHours,
  totalBreak,
  timezone = "America/Los_Angeles",
  isSubmitting: externalIsSubmitting = false,
}: ShiftReportModalProps) {
  const [report, setReport] = useState("");

  const handleSubmit = async () => {
    if (!report.trim()) return;

    try {
      await onSubmit(report);
      setReport("");
    } catch (error) {
      console.error("Failed to submit report:", error);
    }
  };

  // Format clock out time with timezone
  const formatClockOutTime = () => {
    if (!clockOutTime) return null;
    const dt = DateTime.fromISO(clockOutTime).setZone(timezone);
    return `${dt.toFormat("hh:mm a")} ${dt.toFormat("ZZZZ")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Shift Report Required
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <span>Please submit your shift report before continuing.</span>
            {clockOutTime && (
              <span className="text-sm">
                Clocked out at: <span className="font-semibold text-foreground">{formatClockOutTime()}</span>
              </span>
            )}
            {totalHours !== undefined && (
              <span className="text-sm">
                Total hours worked: <span className="font-semibold text-foreground">{formatHours(totalHours)}</span>
                {totalBreak !== undefined && totalBreak > 0 && (
                  <span className="text-muted-foreground"> (breaks: {totalBreak}min)</span>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="report">Shift Report</Label>
            <Textarea
              id="report"
              placeholder="Write your shift report here...

Example:
- Completed order processing system updates
- Fixed bug in checkout flow
- Started working on new dashboard feature

Issues:
- Waiting for API documentation for payment integration"
              value={report}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport(e.target.value)}
              className="min-h-[250px] mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={externalIsSubmitting || !report.trim()}
            className="gap-2 w-full sm:w-auto"
          >
            <Send className="h-4 w-4" />
            {externalIsSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
