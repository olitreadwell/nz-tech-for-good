import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Header } from "@/components/Header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/directory",
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockReturnValue({ matches: false }),
});

describe("Header", () => {
  it("renders the site name", () => {
    render(<Header />);
    expect(screen.getByText("NZ Tech-for-Good")).toBeInTheDocument();
  });

  it("has mobile menu button", () => {
    render(<Header />);
    const btns = screen.getAllByTestId("menu-toggle");
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });

  it("shows nav links when mobile menu is opened", () => {
    render(<Header />);
    fireEvent.click(screen.getAllByTestId("menu-toggle")[0]);
    expect(screen.getAllByText("Browse").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Map").length).toBeGreaterThanOrEqual(1);
  });

  it("has theme toggle button", () => {
    render(<Header />);
    const btns = screen.getAllByLabelText("Toggle theme");
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });
});
