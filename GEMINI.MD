# GEMINI Coding Rules – Next.js 16 People Management Web App (Compact)

1. UI: Use **shadcn/ui** components for all pages and components.  
   - Forms, tables, modals, filters, dashboards must follow the design system.

2. Data: Use **TanStack Query** for all async calls.  
   - Fetchers and mutations go in `features/<feature>/api`.  
   - Co-locate queries with the relevant feature (e.g., `features/employees/api/getEmployees.ts`).  
   - Always handle loading, error, and success states.

3. State: Use **Zustand** for all client/UI state.  
   - Stores go in `features/<feature>/store`.  
   - Examples: selected employee, active filters, modal open/close states.  
   - Avoid `useState` for shared UI logic.

4. Architecture: Feature-based, **no `src/` folder**:
app/(routes)/feature/page.tsx
features/<feature>/{components, hooks, api, store, schema, utils}
lib/{api, utils, auth, db}
- Pages must stay thin: only layout and wiring.  
- Move business logic, API calls, and state management to hooks, api, or store.  

5. TypeScript: Strict typing only; no `any`.  
- Use **Zod** for input/output validation.  
- Shared types go in `features/<feature>/schema`.

6. RSC: Use React Server Components by default.  
- Use `"use client"` only for interactive components (stateful, modals, forms, etc.).

7. Components: Reusable, focused, and small.  
- Extract repeated patterns (tables, cards, filters) into components.  
- Avoid duplicated logic across pages.

8. Performance: Memoize expensive values with `useMemo` and callbacks with `useCallback`.  
- Optimize TanStack Query usage and avoid unnecessary rerenders.

9. Use reusable helpers like for timezone and other formatters.