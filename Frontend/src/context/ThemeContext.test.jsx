import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        Toggle mode
      </button>
    </div>
  );
}

const MOBILE_VIEWPORT = { width: 375, height: 667 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

// Simulate the browser viewport size inside jsdom (no real layout engine,
// so we override the window dimensions directly).
function setViewport({ width, height } = MOBILE_VIEWPORT) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
}

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

describe("ThemeProvider mode persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("uses the machine light mode on first visit", () => {
    renderTheme();

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("uses the machine dark mode when no saved mode exists", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));

    renderTheme();

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("saves a manually changed mode", () => {
    renderTheme();

    fireEvent.click(screen.getByRole("button", { name: "Toggle mode" }));

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("restores the selected mode after logout and login", () => {
    const firstRender = renderTheme();
    fireEvent.click(screen.getByRole("button", { name: "Toggle mode" }));

    expect(localStorage.getItem("theme")).toBe("dark");

    firstRender.unmount();

    renderTheme();
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});

describe("ThemeProvider on a mobile viewport", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    setViewport(MOBILE_VIEWPORT);
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps the viewport at mobile dimensions", () => {
    expect(window.innerWidth).toBe(MOBILE_VIEWPORT.width);
    expect(window.innerHeight).toBe(MOBILE_VIEWPORT.height);
  });

  it("starts in light mode on a phone when no mode is saved", () => {
    renderTheme();

    expect(window.innerWidth).toBeLessThan(DESKTOP_VIEWPORT.width);
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("honours a mobile dark-mode preference and persists it", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));

    renderTheme();

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    cleanup();

    // Simulate leaving and returning to the dashboard on the same phone.
    renderTheme();
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("toggles theme on a phone and reflects it on the document root", () => {
    renderTheme();

    fireEvent.click(screen.getByRole("button", { name: "Toggle mode" }));

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
