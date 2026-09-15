import { describe, expect, it, vi } from "vitest";
import { createDeckStorage, DECK_STORAGE_KEY } from "@/lib/deck-storage";
import { serializeStoredDecks } from "@/lib/deck-serialization";
import { createDeck } from "@/tests/deck-fixtures";

function setup(source: string | null = null) {
  let value = source;
  const storage = {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => { value = next; }),
  };
  return { storage, store: createDeckStorage(() => storage), value: () => value };
}

describe("browser deck persistence", () => {
  it("keeps snapshots stable and updates them only after a successful save", () => {
    const { store, storage } = setup();
    const initial = store.read();
    expect(store.read()).toBe(initial);
    expect(store.write([createDeck()], initial)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(DECK_STORAGE_KEY, serializeStoredDecks([createDeck()]));
    expect(store.read().decks).toEqual([createDeck()]);
    expect(store.read()).toBe(store.read());
  });

  it.each([
    "",
    "broken json",
    JSON.stringify({ version: 2, decks: [] }),
    serializeStoredDecks([createDeck(), createDeck({ id: "invalid", name: "" })]),
    serializeStoredDecks([createDeck(), createDeck()]),
  ])("preserves unreadable or ambiguous storage without overwriting it: %s", (source) => {
    const { store, storage, value } = setup(source);
    const initial = store.read();
    expect(initial.error).toBeTruthy();
    expect(store.write([], initial)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(value()).toBe(source);
  });

  it("keeps readable decks available for individual export in a damaged collection", () => {
    const { store } = setup(serializeStoredDecks([createDeck(), createDeck({ name: "" })]));
    expect(store.read().decks).toEqual([createDeck()]);
  });

  it("does not publish unsaved edits on quota failure and allows a retry", () => {
    const { store, storage, value } = setup(serializeStoredDecks([createDeck()]));
    const initial = store.read();
    storage.setItem.mockImplementationOnce(() => { throw new Error("Quota exceeded"); });
    const next = [createDeck({ name: "Updated" })];
    expect(store.write(next, initial)).toBe(false);
    expect(store.read().decks).toEqual(initial.decks);
    expect(store.read().error).toContain("not saved");
    expect(value()).toBe(initial.source);
    expect(store.write(next, store.read())).toBe(true);
    expect(store.read().error).toBeNull();
  });

  it("retains the last readable decks when reads fail and recovers when access returns", () => {
    const { store, storage } = setup(serializeStoredDecks([createDeck()]));
    store.read();
    storage.getItem.mockImplementation(() => { throw new Error("Blocked"); });
    const failed = store.read();
    expect(failed.decks).toEqual([createDeck()]);
    expect(store.read()).toBe(failed);
    expect(store.write([], failed)).toBe(false);
    storage.getItem.mockReturnValue(serializeStoredDecks([createDeck()]));
    expect(store.read().error).toBeNull();
  });

  it("handles a blocked storage getter", () => {
    const store = createDeckStorage(() => { throw new Error("SecurityError"); });
    expect(store.read().error).toContain("unavailable");
    expect(store.write([], store.read())).toBe(false);
  });

  it("refuses stale writes after another tab changes the collection", () => {
    const { store, storage } = setup();
    const initial = store.read();
    const otherDeck = createDeck({ id: "other-tab" });
    storage.setItem(DECK_STORAGE_KEY, serializeStoredDecks([otherDeck]));
    expect(store.write([createDeck()], initial)).toBe(false);
    expect(store.read().decks).toEqual([otherDeck]);
    expect(store.read().error).toContain("another tab");
  });
});
