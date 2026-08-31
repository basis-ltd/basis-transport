import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/inputs/Button";
import { removeSavedItem, savedKey, saveItem, useSavedItems } from "./saved";
import type { SavedItem } from "./types";

export default function SaveButton({
  href,
  label,
  kind,
}: {
  href: string;
  label: string;
  kind: SavedItem["kind"];
}) {
  const key = savedKey(href),
    items = useSavedItems(),
    saved = items.some((s) => s.key === key);
  return (
    <Button
      type="button"
      aria-pressed={saved}
      onClick={() => {
        try {
          if (saved) removeSavedItem(key);
          else saveItem({ key, href, label, kind });
          toast.success(
            saved ? "Removed from this device" : "Saved on this device",
          );
        } catch (e) {
          toast.error((e as Error).message);
        }
      }}
    >
      {saved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
