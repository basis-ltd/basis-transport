import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/inputs/Button";
import { useAppSelector } from "@/states/hooks";
import { loginUrl } from "@/helpers/authRedirect.helper";
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
  const token = useAppSelector((s) => s.auth.token);
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Button
      type="button"
      aria-pressed={saved}
      onClick={() => {
        if (!token) {
          toast.message("Sign in to save this journey.");
          navigate(loginUrl(`${location.pathname}${location.search}`));
          return;
        }
        try {
          if (saved) removeSavedItem(key);
          else saveItem({ key, href, label, kind });
          toast.success(saved ? "Removed from saved journeys" : "Saved");
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
