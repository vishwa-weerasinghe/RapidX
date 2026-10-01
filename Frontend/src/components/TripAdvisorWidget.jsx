import { useEffect, useRef } from "react";

export default function TripAdvisorWidget({ className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Travelers' Choice 2025 Award Script
    const certScriptId = "ta-widget-script-450";
    if (!document.getElementById(certScriptId)) {
      const s1 = document.createElement("script");
      s1.id = certScriptId;
      s1.src =
        "https://www.jscache.com/wejs?wtype=certificateOfExcellence&uniq=450&locationId=15640558&lang=en_US&year=2025&display_version=2";
      s1.async = true;
      s1.setAttribute("data-loadtrk", "");
      s1.onload = () => {
        s1.loadtrk = true;
      };
      document.body.appendChild(s1);
    }

    // 2. Rated Excellent Rating Badge Script
    const excScriptId = "ta-widget-script-82";
    if (!document.getElementById(excScriptId)) {
      const s2 = document.createElement("script");
      s2.id = excScriptId;
      s2.src =
        "https://www.jscache.com/wejs?wtype=excellent&uniq=82&locationId=15640558&lang=en_US&display_version=2";
      s2.async = true;
      s2.setAttribute("data-loadtrk", "");
      s2.onload = () => {
        s2.loadtrk = true;
      };
      document.body.appendChild(s2);
    }

    // Re-trigger TripAdvisor renderer if already loaded
    try {
      if (window.ta && typeof window.ta.initWidgets === "function") {
        window.ta.initWidgets();
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`tripadvisor-widget flex flex-wrap items-center justify-center gap-6 my-6 ${className}`}
    >
      {/* 1. Official Travelers' Choice 2025 Badge */}
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

      {/* 2. Official Rated Excellent Badge */}
      <div
        id="TA_excellent82"
        className="TA_excellent overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-2"
      >
        <ul id="fulHQ2" className="TA_links O5nXgm3JH list-none m-0 p-0">
          <li id="6ItWdlle6ei" className="6DEWWPfRn9m">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.tripadvisor.com/Attraction_Review-g304133-d15640558-Reviews-Minneriya_Wild_Jeep_Safari-Dambulla_Central_Province.html"
            >
              <img
                src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
                alt="TripAdvisor Rated Excellent"
                className="widEXCIMG max-h-16 sm:max-h-20 object-contain"
                id="CDSWIDEXCLOGO"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
