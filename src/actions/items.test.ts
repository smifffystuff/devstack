import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  createItem: vi.fn(),
  deleteItem: vi.fn(),
  updateItem: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
} from "@/lib/db/items";
import { createItem, deleteItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockCreateItemQuery = vi.mocked(createItemQuery);
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

describe("createItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await createItem({ title: "Test", typeName: "Snippet" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation error for missing title", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ title: "", typeName: "Snippet" });

    expect(result.success).toBe(false);
    expect(mockCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation error for missing typeName", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ title: "Test" });

    expect(result.success).toBe(false);
    expect(mockCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns error when type is invalid", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCreateItemQuery.mockResolvedValue(null);

    const result = await createItem({ title: "Test", typeName: "Invalid" });

    expect(result).toEqual({ success: false, error: "Invalid item type" });
  });

  it("returns success with created item", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const mockItem = { id: "item-1", title: "Test" };
    mockCreateItemQuery.mockResolvedValue(mockItem as never);

    const result = await createItem({ title: "Test", typeName: "Snippet" });

    expect(result).toEqual({ success: true, data: mockItem });
    expect(mockCreateItemQuery).toHaveBeenCalledWith("user-1", {
      title: "Test",
      typeName: "Snippet",
      tags: [],
    });
  });

  it("returns error when database throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCreateItemQuery.mockRejectedValue(new Error("DB error"));

    const result = await createItem({ title: "Test", typeName: "Snippet" });

    expect(result).toEqual({ success: false, error: "Failed to create item" });
  });
});
