import { useMemo } from "react";

/**
 * Stacked horizontal bar chart showing package popularity
 * for the current month. Each bar is split into Confirmed
 * (green) and Unconfirmed (amber) segments.
 */
export default function PackagePopularityChart({ appointments, isDark }) {
  const stats = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      const rawName = String(a.Package_Name || "Unnamed Package").trim();
      const name = rawName || "Unnamed Package";
      const isConfirmed = String(a.Status || "").toLowerCase() === "confirmed";
      const entry = map.get(name) || { name, confirmed: 0, unconfirmed: 0 };
      if (isConfirmed) entry.confirmed += 1;
      else entry.unconfirmed += 1;
      map.set(name, entry);
    });
    return [...map.values()]
      .map((e) => ({ ...e, total: e.confirmed + e.unconfirmed }))
      .sort((a, b) => b.total - a.total);
  }, [appointments]);

  if (stats.length === 0) return null;

  const maxTotal = Math.max(...stats.map((s) => s.total), 1);
  const labelWidth = 180;
  const barMaxWidth = 520;
  const rowHeight = 42;
  const legendHeight = 26;
  const chartHeight = legendHeight + stats.length * rowHeight + 16;
  const totalWidth = labelWidth + barMaxWidth + 130;

  const confirmedColor = "#29AB87";
  const unconfirmedColor = isDark ? "#b45309" : "#f59e0b";
  const textColor = isDark ? "#e5e7eb" : "#1f2937";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";
  const trackColor = isDark ? "#26332f" : "#f3f4f6";

  const truncate = (name) =>
    name.length > 26 ? `${name.slice(0, 25)}…` : name;

  return (
    <div className="card p-4 mb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-charcoal dark:text-white">
            Package Popularity
          </h2>
          <p className="text-sm text-muted mt-1">
            Booking distribution by package for this month (stacked by status).
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: confirmedColor }}
            />
            Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: unconfirmedColor }}
            />
            Unconfirmed
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={totalWidth} height={chartHeight} className="min-w-full">
          {stats.map((pkg, i) => {
            const y = legendHeight + i * rowHeight;
            const confirmedW = (pkg.confirmed / maxTotal) * barMaxWidth;
            const unconfirmedW = (pkg.unconfirmed / maxTotal) * barMaxWidth;
            const hasConfirmed = pkg.confirmed > 0;
            const hasUnconfirmed = pkg.unconfirmed > 0;
            const isSingleSegment = !(hasConfirmed && hasUnconfirmed);

            return (
              <g key={pkg.name}>
                <text
                  x={labelWidth - 10}
                  y={y + 15}
                  textAnchor="end"
                  fontSize={12}
                  fontWeight={500}
                  fill={textColor}
                >
                  {truncate(pkg.name)}
                </text>

                {/* track */}
                <rect
                  x={labelWidth}
                  y={y + 2}
                  width={barMaxWidth}
                  height={18}
                  rx={4}
                  fill={trackColor}
                />

                {/* confirmed segment */}
                {hasConfirmed && (
                  <rect
                    x={labelWidth}
                    y={y + 2}
                    width={confirmedW}
                    height={18}
                    rx={isSingleSegment ? 4 : 0}
                    fill={confirmedColor}
                  >
                    <title>{`${pkg.name} — Confirmed: ${pkg.confirmed}`}</title>
                  </rect>
                )}

                {/* unconfirmed segment */}
                {hasUnconfirmed && (
                  <rect
                    x={labelWidth + confirmedW}
                    y={y + 2}
                    width={unconfirmedW}
                    height={18}
                    rx={isSingleSegment ? 4 : 0}
                    fill={unconfirmedColor}
                  >
                    <title>{`${pkg.name} — Unconfirmed: ${pkg.unconfirmed}`}</title>
                  </rect>
                )}

                {/* total count */}
                <text
                  x={labelWidth + confirmedW + unconfirmedW + 10}
                  y={y + 16}
                  fontSize={12}
                  fontWeight={600}
                  fill={mutedColor}
                >
                  {pkg.total}
                </text>

                {/* percentage */}
                <text
                  x={labelWidth + barMaxWidth + 40}
                  y={y + 16}
                  fontSize={11}
                  fill={mutedColor}
                >
                  {Math.round((pkg.total / maxTotal) * 100)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}