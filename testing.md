# Frontend testing

The frontend's business logic — everything under `src/hooks/` and `src/utils/` — is covered by a [Vitest](https://vitest.dev) suite. UI components (`src/components/`, `src/pages/`) are not covered yet; see [What's not covered](#whats-not-covered) below.

## Stack

- **[Vitest](https://vitest.dev)** — test runner. Reuses the project's existing `vite.config.ts` instead of a separate config file.
- **[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)** — provides `renderHook`, `act` and `waitFor`, used to exercise custom hooks without mounting a real component tree.
- **[jsdom](https://github.com/jsdom/jsdom)** — simulated DOM environment that `@testing-library/react` needs to run in Node.

All three are dev dependencies only; nothing ships to production because of them.

## Running the tests

```bash
npm test          # runs the whole suite once and exits (CI-friendly)
npm run test:watch  # re-runs affected tests on file changes
```

## Continuous integration

[`.github/workflows/frontend-ci.yml`](.github/workflows/frontend-ci.yml) runs `npm run lint`, `npm run build` and `npm test` on every push and pull request targeting `main`, so a broken test (or a lint/type error) shows up on the PR instead of being caught after merging.

## Where tests live

Tests are colocated with the code they test, using the `*.test.ts` suffix next to the source file:

```
src/utils/boardHelpers.ts
src/utils/boardHelpers.test.ts

src/hooks/useBoard.ts
src/hooks/useBoard.test.ts
```

This keeps a test next to the file it exercises instead of a parallel `__tests__/` tree, so moving or deleting a source file makes its test impossible to miss.

## What's covered

| File | What's exercised |
|---|---|
| `utils/boardHelpers.ts` | `findCard` (found / not found / null board) and `parseId` (card / column / unknown prefixes) |
| `hooks/useAutoDismiss.ts` | dismissal after the default and a custom delay, timer cancellation when the value changes before it fires |
| `hooks/useSlowRequestHint.ts` | hint appearing after a delay, resetting when `active` turns back to `false` |
| `hooks/useBoard.ts` | initial load, `NaN` board id, API failure, manual `loadBoard()` refetch |
| `hooks/useBoardActions.ts` | add/delete/move card, board renaming, error propagation to `actionError`, the concurrency guards that ignore a second call while one is in flight |
| `hooks/useDragAndDrop.ts` | same-column reordering, moving a card to another column (dropped on the column or on a card), every early-return branch, resync (`loadBoard`) on API failure |
| `hooks/useBoardRealTime.ts` | connecting and joining the board on mount, the `BoardChanged` event, reconnection handling, cleanup on unmount |

57 tests in total across these 7 files.

## Conventions used in this suite

### Mocking the `api/` layer

Hooks that call `api/boards`, `api/cards` or `api/realtime` mock those modules with `vi.mock(...)` rather than hitting the real `apiFetch`/`fetch`. This keeps hook tests fast and independent of a running backend, and lets each test control exactly what the "server" returns (success, a specific error, or a promise that never resolves to test in-flight state).

```ts
vi.mock("../api/cards", () => ({
    moveCard: vi.fn(),
}));

const moveCardMock = vi.mocked(moveCard);
```

**Gotcha:** `api/config.ts` throws at import time if `VITE_API_URL` isn't set. Since `vi.mock` replaces the whole module graph behind it, a test that mocks `api/boards`/`api/cards`/`api/realtime` never actually imports the real `api/config.ts`, so this never triggers during tests — there's no `.env.test` file, and none is needed as long as any new hook test mocks the `api/*` modules it (even transitively) depends on.

### Fake timers

`useAutoDismiss` and `useSlowRequestHint` are driven by `setTimeout`. Tests use `vi.useFakeTimers()` / `vi.useRealTimers()` in `beforeEach`/`afterEach`, and advance time with `vi.advanceTimersByTime(...)`.

When the assertion reads a hook's **returned state** (not just whether a mock function was called), the timer advance must be wrapped in `act()`, otherwise React never flushes the resulting re-render and the assertion sees stale state:

```ts
act(() => vi.advanceTimersByTime(4_000));
expect(result.current).toBe(true);
```

### The "harness hook" pattern for interdependent state

`useDragAndDrop` takes `board` and `setBoard` as arguments rather than owning the state itself (so `BoardPage` can share it with other hooks). To test it realistically, the test file wraps it in a small local hook that owns a real `useState` and forwards it in, instead of manually replaying the updater functions passed to a mocked `setBoard`:

```ts
function useHarness(initialBoard: Board | null, loadBoard: () => void, setError: (msg: string) => void) {
    const [board, setBoard] = useState(initialBoard);
    const dnd = useDragAndDrop(board, setBoard, loadBoard, setError);
    return { board, ...dnd };
}
```

This lets assertions check the resulting `board` shape after a drag operation instead of re-implementing `arrayMove`/splice logic in the test to predict what a captured updater function would have produced.

### Testing concurrency guards

Some handlers ignore a second call while the first is still in flight (e.g. `useBoardActions.handleAddCard`, `handleMoveCard`). Testing this requires the mocked API call to stay pending on purpose, and the two invocations to happen in **separate** `act()` calls so React actually re-renders (and the hook's closures pick up the updated "in flight" state) between them:

```ts
let resolveCreate!: (card: Card) => void;
createCardMock.mockImplementation(
    () => new Promise<Card>((resolve) => { resolveCreate = resolve; })
);

act(() => { result.current.handleAddCard(10); });      // starts, sets addingColumns[10] = true
act(() => { result.current.handleAddCard(10); });      // sees it's already in flight, no-ops
expect(createCardMock).toHaveBeenCalledTimes(1);

await act(async () => {
    resolveCreate(makeCard());
    await Promise.resolve();
});
```

Calling both invocations inside the *same* `act()` would use the same stale closure for both and defeat the guard being tested.

### Mocking `@microsoft/signalr`

`useBoardRealTime` opens a real WebSocket-backed connection via `HubConnectionBuilder`. The test replaces the whole `@microsoft/signalr` module with a fake builder whose `build()` returns a plain object exposing the handful of methods the hook actually calls (`on`, `onreconnected`, `invoke`, `start`, `stop`), capturing the registered `BoardChanged`/reconnection callbacks so tests can trigger them manually.

## What's not covered

- **Components and pages** (`src/components/`, `src/pages/`) — no rendering/DOM-interaction tests yet. Adding `@testing-library/jest-dom` and `@testing-library/user-event` would be the natural next step if this is wanted.
- **`src/api/*.ts`** — thin wrappers around `apiFetch`; not tested directly since the hooks that call them are already tested with those modules mocked.
- **End-to-end flows** (login → create board → drag a card) — none set up; would need Playwright or Cypress.
- **Coverage reporting** — not configured. `@vitest/coverage-v8` could be added and wired into `npm test -- --coverage` if coverage numbers become useful.
