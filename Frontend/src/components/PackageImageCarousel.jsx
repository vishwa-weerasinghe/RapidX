import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PackageImageCarousel({ images = [], fallbackSrc = "", alt = "Package image", className = "" }) {
  const slides = (Array.isArray(images) ? images : [])
    .map((image) => typeof image === "string" ? image : image?.url || image?.image_url || image?.secure_url)
    .filter(Boolean);
  if (slides.length === 0 && fallbackSrc) slides.push(fallbackSrc);

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const slidesKey = slides.join("|");

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(0, slides.length - 1)));
  }, [slidesKey]);

  const showPrevious = () => {
    setCurrentIndex((index) => (index === 0 ? slides.length - 1 : index - 1));
  };
  const showNext = () => {
    setCurrentIndex((index) => (index + 1) % slides.length);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const distance = touchStartX.current - event.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(distance) < 40 || slides.length < 2) return;
    distance > 0 ? showNext() : showPrevious();
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
      aria-label={`${alt}${slides.length > 1 ? `, image ${currentIndex + 1} of ${slides.length}` : ""}`}
    >
      {slides.length > 0 && (
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${currentIndex === 0 ? 0 : -currentIndex * 100}%)` }}
        >
          {slides.map((src, index) => (
            <div key={`${src}-${index}`} className="h-full w-full shrink-0">
              <img
                src={src}
                alt={`${alt} ${index + 1}`}
                className="h-full w-full object-cover object-center"
                loading="lazy"
                draggable="false"
              />
            </div>
          ))}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous package image"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next package image"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur-sm">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show package image ${index + 1} of ${slides.length}`}
                aria-current={currentIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${currentIndex === index ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}