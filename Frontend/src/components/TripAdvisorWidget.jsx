import { useEffect, useRef } from "react";

export default function TripAdvisorWidget({ className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Travelers' Choice 2025 Award Script
    const certScriptId = "ta-widget-script-450";
    if (!document.getElementById(certScriptId)) {
      const s = document.createElement("script");
      s.id = certScriptId;
      s.src =
        "https://www.jscache.com/wejs?wtype=certificateOfExcellence&uniq=450&locationId=15640558&lang=en_US&year=2025&display_version=2";
      s.async = true;
      s.setAttribute("data-loadtrk", "");
      s.onload = () => {
        s.loadtrk = true;
        try {
          if (window.ta && typeof window.ta.initWidgets === "function") {
            window.ta.initWidgets();
          }
        } catch (e) {
          // ignore
        }
      };
      document.body.appendChild(s);
    } else {
      try {
        if (window.ta && typeof window.ta.initWidgets === "function") {
          window.ta.initWidgets();
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`tripadvisor-widget flex items-center justify-center my-4 ${className}`}
    >
      {/* Official Travelers' Choice 2025 Badge */}
      <div
        id="TA_certificateOfExcellence450"
        className="TA_certificateOfExcellence overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-2"
      >
        <ul id="T60qTZ" className="TA_links fQBjH50uH list-none m-0 p-0">
          <li id="M3J31rKYPuH" className="bKGE5A">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.tripadvisor.com/Attraction_Review-g304133-d15640558-Reviews-Minneriya_Wild_Jeep_Safari-Dambulla_Central_Province.html"
            >
              <img
                src="https://static.tacdn.com/img2/travelers_choice/widgets/tchotel_2025_L.png"
                alt="TripAdvisor Travelers' Choice 2025"
                className="widCOEImg max-h-24 sm:max-h-28 object-contain"
                id="CDSWIDCOELOGO"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
