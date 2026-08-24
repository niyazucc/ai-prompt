# React Project Instructions & Coding Standards

> **Note for AI Assistants & Developers:** This file defines the architecture, directory structure, and coding practices for this React project. Follow these conventions when reading, generating, or modifying code.

---

## 1. Project Tech Stack

- **Framework / Build Tool:** React 19+ with Vite
- **Language:** TypeScript in strict mode
- **Styling:** Component-scoped CSS, `clsx`, and `tailwind-merge` when class composition is needed
- **State Management:** Local React state by default; TanStack Query for server state and Zustand only for genuinely global UI state
- **Routing:** React Router when multiple URL-addressable pages are introduced
- **Forms & Validation:** React Hook Form + Zod for complex or server-bound forms
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library

## 2. Directory Structure

Use a feature-based, modular structure. Keep business-specific components collocated with their types, utilities, and tests.

```text
src/
├── assets/             # Static assets: images, SVGs, and fonts
├── components/         # Shared reusable UI primitives
│   ├── ui/             # Generic controls: Button, Input, Modal, Badge
│   ├── layout/         # Shell components: Header, Sidebar, Footer
│   └── feedback/       # Loading, toast, and error states
├── features/           # Business features with their UI and logic
│   └── prompt-builder/ # Prompt form, option data, types, and generation logic
├── hooks/              # Truly global custom hooks
├── lib/                # Configured third-party library instances
├── routes/             # Router configuration and thin page wrappers
├── services/           # API functions and SDK integrations
├── stores/             # Global state stores, when justified
├── types/              # Shared TypeScript types
├── utils/              # Pure, cross-feature helpers
├── App.tsx             # Root application composition
└── main.tsx            # DOM entry point
```

## 3. Component Architecture

### Pure Components and Reusability

- Extract a UI element into `components/ui/` only when it is genuinely reusable across features.
- Keep domain-specific UI inside `features/<feature-name>/components/`.
- Keep page and route files thin. They should arrange feature containers, not hold business logic.
- Prefer composition over large components with many behavior flags.

### Props

- Define explicit TypeScript interfaces or types for component props.
- Do **not** use `React.FC` or `React.FunctionComponent`.
- Destructure props in the function signature where it remains readable.
- Prefer required props. Make a prop optional only when there is a clear default or absence is meaningful.

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  // ...
}
```

## 4. TypeScript Standards

- Keep strict mode enabled. Do not silence errors with `any`, broad assertions, or `@ts-ignore`.
- Prefer `type` for unions and mapped types; use `interface` for extensible object contracts.
- Model fixed choices with literal unions derived from `as const` data.
- Validate untrusted boundary data before it reaches components.
- Keep types near their owning feature unless shared by multiple features.

## 5. State and Data Flow

- Keep state as close as possible to where it is used.
- Derive values during render instead of synchronizing duplicate state with effects.
- Use controlled inputs for form state that affects live previews.
- Isolate browser APIs and async side effects in event handlers, hooks, or services.
- Add a global store only when unrelated branches of the UI must read and update the same state.

## 6. Styling and UX

- Build mobile-first and verify all layouts at narrow and wide breakpoints.
- Use design tokens (CSS custom properties) for color, spacing, radius, and shadows.
- Preserve visible focus states and sufficient contrast.
- Use semantic HTML, explicit labels, and ARIA only when native semantics are insufficient.
- Honor `prefers-reduced-motion` for non-essential animation.
- Every asynchronous action must expose loading, success, empty, and error feedback as applicable.

## 7. Naming and Imports

- Components: `PascalCase.tsx`; hooks: `useCamelCase.ts`; utilities: `camelCase.ts`.
- Boolean names should read as predicates: `isOpen`, `hasError`, `canSubmit`.
- Event handlers begin with `handle`; callback props begin with `on`.
- Prefer named exports for components and helpers.
- Group imports: external packages first, then local modules, then styles.

## 8. Testing and Quality

- Test user-visible behavior, not internal implementation details.
- Cover prompt generation as a pure function with representative inputs.
- Use accessible queries in component tests.
- Run `npm run build` and `npm run lint` before handoff.
- Avoid dead code, placeholder handlers, and unexplained constants.

## 9. Project-Specific Product Rules

- Prompt generation is deterministic and local until an AI provider is explicitly configured.
- Generated prompts must clearly describe role, task, audience, context, constraints, and expected output.
- Never imply content was sent to an external AI when it was only assembled locally.
- Copy actions must show concise success or failure feedback.
- New content types belong in the prompt-builder configuration instead of duplicated page components.
