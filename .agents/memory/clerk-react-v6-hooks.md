---
name: Clerk React v6 hooks API
description: How useSignIn, useSignUp, and setActive work in @clerk/react v6 (signals-based).
---

## Rule
In `@clerk/react` v6 (installed version 6.12.8), `useSignIn()` returns a **signals value** — not the classic `{ isLoaded, signIn, setActive }` object.

Correct destructuring:
```ts
const { signIn, fetchStatus } = useSignIn();  // fetchStatus: 'idle' | 'fetching'
const { setActive } = useClerk();             // setActive lives here, not on useSignIn
```

After `signIn.create({ strategy: "ticket", ticket })` completes (no error thrown), the session ID is on the signIn object directly:
```ts
await signIn.create({ strategy: "ticket", ticket });
await setActive({ session: signIn.createdSessionId });
```

**Wrong patterns that cause TS errors:**
- `const { isLoaded, signIn, setActive } = useSignIn()` — `isLoaded` and `setActive` don't exist on SignInSignalValue
- `fetchStatus === "loading"` — values are `'idle' | 'fetching'`, not `'loading'`
- `const result = await signIn.create(...)` then `result.createdSessionId` — create() returns `{ error }`, not the resource

**Why:** Clerk v6 migrated to a reactive signals architecture. The legacy hook signatures are in `@clerk/react/dist/legacy` but `setActive` was never part of `useSignIn` — it always belonged to `useClerk()`.

**How to apply:** Any time you write a custom sign-in or sign-up flow with Clerk React v6.
