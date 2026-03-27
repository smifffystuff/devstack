"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCollection } from "@/actions/collections";
import { toast } from "sonner";

interface NewCollectionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NewCollectionDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: NewCollectionDialogProps = {}) {
  const router = useRouter();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen! : internalOpen;

  function setOpen(value: boolean) {
    if (!isControlled) setInternalOpen(value);
    controlledOnOpenChange?.(value);
  }
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setName("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await createCollection({
      name,
      description: description || null,
    });

    setSaving(false);

    if (!result.success) {
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : "Validation failed. Check your inputs.";
      toast.error(errorMsg);
      return;
    }

    toast.success("Collection created");
    resetForm();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" />
          }
        >
          <Archive className="size-3.5" />
          <span className="hidden sm:inline">New Collection</span>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
          <DialogDescription>
            Create a collection to organize your items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="collection-description">Description</Label>
            <Textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Creating…" : "Create Collection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
