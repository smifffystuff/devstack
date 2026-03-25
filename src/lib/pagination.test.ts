import { describe, it, expect } from "vitest";
import { pageUrl, getPageNumbers } from "./pagination";

describe("pageUrl", () => {
  it("returns base path for page 1", () => {
    expect(pageUrl("/dashboard/items/snippet", 1)).toBe("/dashboard/items/snippet");
  });

  it("appends ?page= for pages > 1", () => {
    expect(pageUrl("/dashboard/items/snippet", 3)).toBe("/dashboard/items/snippet?page=3");
  });
});

describe("getPageNumbers", () => {
  it("returns all pages when totalPages <= 7", () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("shows ellipsis after start when current page is far from start", () => {
    const pages = getPageNumbers(5, 10);
    expect(pages[0]).toBe(1);
    expect(pages[1]).toBe("ellipsis");
  });

  it("shows ellipsis before end when current page is far from end", () => {
    const pages = getPageNumbers(3, 10);
    expect(pages[pages.length - 1]).toBe(10);
    expect(pages[pages.length - 2]).toBe("ellipsis");
  });

  it("shows both ellipses when in the middle of many pages", () => {
    const pages = getPageNumbers(5, 10);
    expect(pages).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("does not show leading ellipsis on page 1", () => {
    const pages = getPageNumbers(1, 10);
    expect(pages).toEqual([1, 2, "ellipsis", 10]);
  });

  it("does not show leading ellipsis on page 3", () => {
    const pages = getPageNumbers(3, 10);
    expect(pages).toEqual([1, 2, 3, 4, "ellipsis", 10]);
  });

  it("does not show trailing ellipsis on last page", () => {
    const pages = getPageNumbers(10, 10);
    expect(pages).toEqual([1, "ellipsis", 9, 10]);
  });

  it("does not show trailing ellipsis near last page", () => {
    const pages = getPageNumbers(8, 10);
    expect(pages).toEqual([1, "ellipsis", 7, 8, 9, 10]);
  });

  it("always includes first and last page", () => {
    for (let current = 1; current <= 20; current++) {
      const pages = getPageNumbers(current, 20);
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(20);
    }
  });

  it("always includes the current page", () => {
    for (let current = 1; current <= 20; current++) {
      const pages = getPageNumbers(current, 20);
      expect(pages).toContain(current);
    }
  });
});
