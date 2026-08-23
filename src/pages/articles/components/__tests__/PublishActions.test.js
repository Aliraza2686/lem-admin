import { describe, it, expect } from "vitest";
import { TRANSITION_DEFS as TRANSITIONS } from "../statusTransitions.js";

const ALL_STATUSES = ["draft", "published", "archived"];

describe("PublishActions status transition map", () => {
  it("defines transitions for every real Article status enum value", () => {
    for (const status of ALL_STATUSES) {
      expect(TRANSITIONS[status]).toBeDefined();
      expect(TRANSITIONS[status].length).toBeGreaterThan(0);
    }
  });

  it("never offers a transition back to the article's own current status", () => {
    for (const status of ALL_STATUSES) {
      const targets = TRANSITIONS[status].map((t) => t.to);
      expect(targets).not.toContain(status);
    }
  });

  it("only ever targets a valid Article status enum value", () => {
    for (const status of ALL_STATUSES) {
      for (const t of TRANSITIONS[status]) {
        expect(ALL_STATUSES).toContain(t.to);
      }
    }
  });

  it("draft can be published or archived", () => {
    expect(TRANSITIONS.draft.map((t) => t.to).sort()).toEqual(["archived", "published"]);
  });

  it("published can be unpublished (back to draft) or archived", () => {
    expect(TRANSITIONS.published.map((t) => t.to).sort()).toEqual(["archived", "draft"]);
  });

  it("archived can be republished or restored to draft", () => {
    expect(TRANSITIONS.archived.map((t) => t.to).sort()).toEqual(["draft", "published"]);
  });

  it("every transition requires a confirmation message (publishing/archiving must not be silent)", () => {
    for (const status of ALL_STATUSES) {
      for (const t of TRANSITIONS[status]) {
        expect(t.confirm).toBeTruthy();
      }
    }
  });
});
