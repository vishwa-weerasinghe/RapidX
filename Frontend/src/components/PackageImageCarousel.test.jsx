import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PackageImageCarousel from "./PackageImageCarousel";

const images = ["/first.jpg", "/second.jpg", "/third.jpg"];

afterEach(cleanup);

describe("PackageImageCarousel", () => {
  it("wraps between slides and lets a dot select a slide", () => {
    render(<PackageImageCarousel images={images} alt="Safari" />);
    const carousel = screen.getByLabelText("Safari, image 1 of 3");
    const track = carousel.firstElementChild;

    fireEvent.click(screen.getByRole("button", { name: "Previous package image" }));
    expect(track.style.transform).toBe("translateX(-200%)");

    fireEvent.click(screen.getByRole("button", { name: "Show package image 2 of 3" }));
    expect(track.style.transform).toBe("translateX(-100%)");

    fireEvent.click(screen.getByRole("button", { name: "Next package image" }));
    expect(track.style.transform).toBe("translateX(-200%)");
    fireEvent.click(screen.getByRole("button", { name: "Next package image" }));
    expect(track.style.transform).toBe("translateX(0%)");
  });

  it("supports touch swiping", () => {
    render(<PackageImageCarousel images={images.slice(0, 2)} alt="Safari" />);
    const carousel = screen.getByLabelText("Safari, image 1 of 2");
    const track = carousel.firstElementChild;

    fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100 }] });
    expect(track.style.transform).toBe("translateX(-100%)");

    fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 200 }] });
    expect(track.style.transform).toBe("translateX(0%)");
  });

  it("keeps each package carousel independent", () => {
    render(
      <>
        <PackageImageCarousel images={images.slice(0, 2)} alt="First package" />
        <PackageImageCarousel images={images.slice(1)} alt="Second package" />
      </>,
    );
    const carousels = [
      screen.getByLabelText("First package, image 1 of 2"),
      screen.getByLabelText("Second package, image 1 of 2"),
    ];

    fireEvent.click(screen.getAllByRole("button", { name: "Next package image" })[0]);
    expect(carousels[0].firstElementChild.style.transform).toBe("translateX(-100%)");
    expect(carousels[1].firstElementChild.style.transform).toBe("translateX(0%)");
  });

  it("hides controls for one image and safely handles an empty list", () => {
    const { rerender } = render(<PackageImageCarousel images={["/only.jpg"]} alt="Single" />);
    expect(screen.getByRole("img", { name: "Single 1" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Next package image" })).toBeNull();

    rerender(<PackageImageCarousel images={[]} alt="Empty" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("button", { name: "Next package image" })).toBeNull();
  });
});