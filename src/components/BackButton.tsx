import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0"
      onClick={() => {
        if (window.history.length > 1) navigate(-1);
        else navigate(fallback);
      }}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
