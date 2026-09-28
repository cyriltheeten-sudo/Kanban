import { describe, it, expect } from "vitest";

describe("PR workflow check", () => {
    it("fails on purpose to verify the merge is blocked", () => {
        expect(1 + 1).toBe(3);
    });
});
