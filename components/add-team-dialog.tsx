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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTeam } from "@/lib/hooks/use-teams";
import { Loader2 } from "lucide-react";

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddTeamDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTeamDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");

  const createTeamMutation = useCreateTeam();

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Generate slug: lowercase, replace spaces with hyphens, remove special chars
    const generatedSlug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      return;
    }

    try {
      await createTeamMutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        logo: logo.trim() || null,
      });

      // Reset form
      setName("");
      setSlug("");
      setLogo("");

      // Close dialog and notify success
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create team:", error);
    }
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setSlug("");
    setLogo("");
    createTeamMutation.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Add a new team to your organization. You will be set as the owner.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Team Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Marketing Team"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            {/* Slug (auto-generated, read-only display) */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="Auto-generated from team name"
                value={slug}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from team name. Used in URLs.
              </p>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL (optional)</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />
            </div>

            {/* Error message */}
            {createTeamMutation.isError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {createTeamMutation.error instanceof Error
                  ? createTeamMutation.error.message
                  : "Failed to create team"}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createTeamMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() || !slug.trim() || createTeamMutation.isPending
              }
            >
              {createTeamMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
