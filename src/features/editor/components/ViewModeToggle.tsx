import { Eye, Columns2, Pencil } from "lucide-react";

import { cn } from "#/lib/cn";
import type { ViewMode } from "../types/editor.types";

import { Button } from "#/components/ui/Button";

const modes: Array<{ label: string; value: ViewMode; icon: typeof Columns2 }> =
  [
    { label: "Split", value: "split", icon: Columns2 },
    { label: "Edit", value: "edit", icon: Pencil },
    { label: "Preview", value: "preview", icon: Eye }
  ];

type ViewModeToggleProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-md border border-slate-800 bg-slate-950 p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;

        return (
          <Button
            aria-pressed={value === mode.value}
            className={cn(
              "h-8 border-0 px-2.5",
              value === mode.value
                ? "bg-slate-800 text-white"
                : "bg-transparent text-slate-400 hover:bg-slate-900"
            )}
            icon={<Icon size={16} />}
            key={mode.value}
            onClick={() => onChange(mode.value)}
            title={`${mode.label} View`}
            variant="ghost"
          >
            <span className="hidden sm:inline">{mode.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
