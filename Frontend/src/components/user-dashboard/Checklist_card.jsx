import { CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const WHAT_TO_BRING = [
  "Light-colored clothing",
  "Cap or hat",
  "Sunscreen",
  "Drinking water",
  "Camera",
];

export function ChecklistCard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`mt-6 max-w-md rounded-2xl border p-4 sm:p-5 backdrop-blur-sm ${
        isDark
          ? "border-border-dark bg-surface/80 text-white"
          : "border-border-light bg-white/70 text-charcoal"
      }`}
    >
      <h5 className={`mb-2.5 text-sm font-bold ${isDark ? "text-white" : "text-charcoal"}`}>
        What to Bring
      </h5>
      <ul className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-2 sm:gap-x-5">
        {WHAT_TO_BRING.map((item) => (
          <li
            key={item}
            className={`flex items-center gap-2 text-sm ${
              isDark ? "text-white/80" : "text-charcoal/75"
            }`}
          >
            <CheckCircle2
              size={15}
              className="shrink-0 text-sacramento dark:text-sacramento-300"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
