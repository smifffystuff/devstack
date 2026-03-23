import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  deleteItem: vi.fn(),
  updateItem: vi.fn(),
}));

import { auth } from "@/auth";
import { deleteItem as deleteItemQuery } from "@/lib/db/items";
import { deleteItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockDeleteItemQuery = vi.mocked(deleteItemQuery);

describe("deleteItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDeleteItemQuery).not.toHaveBeenCalled();
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns not found when item does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteItemQuery.mockResolvedValue(false);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(mockDeleteItemQuery).toHaveBeenCalledWith("user-1", "item-1");
  });

  it("returns success when item is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteItemQuery.mockResolvedValue(true);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteItemQuery).toHaveBeenCalledWith("user-1", "item-1");
  });

  it("returns error when database throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteItemQuery.mockRejectedValue(new Error("DB error"));

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Failed to delete item" });
  });
});
