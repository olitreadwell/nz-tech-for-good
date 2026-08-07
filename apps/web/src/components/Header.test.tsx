import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "@/components/Header";

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
});
