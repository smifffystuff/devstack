import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  getAllCollections: vi.fn(),
  toggleCollectionFavorite: vi.fn(),
}));

import { auth } from "@/auth";
import { toggleCollectionFavorite as toggleCollectionFavoriteQuery } from "@/lib/db/collections";
import { toggleFavoriteCollection } from "./collections";

const mockAuth = vi.mocked(auth);
const mockToggleCollectionFavoriteQuery = vi.mocked(
  toggleCollectionFavoriteQuery,
);

describe("toggleFavoriteCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await toggleFavoriteCollection("col-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockToggleCollectionFavoriteQuery).not.toHaveBeenCalled();
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const result = await toggleFavoriteCollection("col-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns not found when collection does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleCollectionFavoriteQuery.mockResolvedValue(null);

    const result = await toggleFavoriteCollection("col-1");

    expect(result).toEqual({ success: false, error: "Collection not found" });
    expect(mockToggleCollectionFavoriteQuery).toHaveBeenCalledWith(
      "user-1",
      "col-1",
    );
  });

  it("returns success with isFavorite true when toggled on", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleCollectionFavoriteQuery.mockResolvedValue(true);

    const result = await toggleFavoriteCollection("col-1");

    expect(result).toEqual({ success: true, data: { isFavorite: true } });
  });

  it("returns success with isFavorite false when toggled off", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleCollectionFavoriteQuery.mockResolvedValue(false);

    const result = await toggleFavoriteCollection("col-1");

    expect(result).toEqual({ success: true, data: { isFavorite: false } });
  });

  it("returns error when database throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleCollectionFavoriteQuery.mockRejectedValue(new Error("DB error"));

    const result = await toggleFavoriteCollection("col-1");

    expect(result).toEqual({
      success: false,
      error: "Failed to update favorite",
    });
  });
});
