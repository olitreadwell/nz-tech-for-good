import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// next/link references window at module level — mock it before any test loads
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    const React = require("react");
    return React.createElement("a", { href }, children);
  },
}));

// next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
