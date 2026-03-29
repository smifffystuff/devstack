import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkItemLimit, checkCollectionLimit } from "./plan-limits";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

const mockItemCount = prisma.item.count as ReturnType<typeof vi.fn>;
const mockCollectionCount = prisma.collection.count as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkItemLimit", () => {
  it("returns true when count is 0 (well under limit)", async () => {
    mockItemCount.mockResolvedValue(0);
    expect(await checkItemLimit("user-1")).toBe(true);
  });

  it("returns true when count is 49 (one below limit)", async () => {
    mockItemCount.mockResolvedValue(49);
    expect(await checkItemLimit("user-1")).toBe(true);
  });

  it("returns false when count is 50 (at limit)", async () => {
    mockItemCount.mockResolvedValue(50);
    expect(await checkItemLimit("user-1")).toBe(false);
  });

  it("returns false when count is 60 (over limit)", async () => {
    mockItemCount.mockResolvedValue(60);
    expect(await checkItemLimit("user-1")).toBe(false);
  });
});

describe("checkCollectionLimit", () => {
  it("returns true when count is 0", async () => {
    mockCollectionCount.mockResolvedValue(0);
    expect(await checkCollectionLimit("user-1")).toBe(true);
  });

  it("returns true when count is 2 (one below limit)", async () => {
    mockCollectionCount.mockResolvedValue(2);
    expect(await checkCollectionLimit("user-1")).toBe(true);
  });

  it("returns false when count is 3 (at limit)", async () => {
    mockCollectionCount.mockResolvedValue(3);
    expect(await checkCollectionLimit("user-1")).toBe(false);
  });

  it("returns false when count is 5 (over limit)", async () => {
    mockCollectionCount.mockResolvedValue(5);
    expect(await checkCollectionLimit("user-1")).toBe(false);
  });
});
