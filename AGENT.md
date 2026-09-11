<!-- BEGIN:frontend-agent-rules -->

## Project structure

Follow the existing repository structure before introducing new directories or organizational patterns.
Keep routes, page layouts, and page-level components in `src/pages/**` (or `src/routes/**` depending on your routing setup).
Keep global styles and Tailwind theme tokens in `src/index.css` (or `src/app/globals.css`).
Keep reusable application components in `src/components/**`, shared UI primitives and composed controls in `src/components/ui/**`, and reusable form input controls in `src/components/form/input/**`.
Keep validation schemas in `src/lib/schemas/**`, general utilities in `src/lib/**`, and client state stores in `src/stores/**` (e.g., Zustand, Context, or Redux).
Keep static interface assets in `public/icons/**` and raster/content imagery in `public/images/**`.
Keep route-specific screen and layout markup directly in its corresponding `src/pages/**` file.
Do not create *Screen components or one-use wrapper components that only return a page's markup.
Extract a component only when it is meaningfully reusable, stateful, or isolates a substantial interaction such as a form, complex navigation, or UI primitive.
Keep the CMS user add/edit form state, validation, and field markup directly in `src/pages/dashboard/index.tsx`; do not extract a shared user-form component for this route.

## Tailwind and UI conventions

Use Tailwind's standard utility scale first, such as `text-xs`, `text-sm`, `text-lg`, `w-1/4`, `rounded-lg`, and `shadow-sm`.
Do not add one-off arbitrary utilities such as `text-[12px]`, `w-[284px]`, custom hexadecimal backgrounds, or arbitrary shadows in application components when a standard utility or project token can represent the value.
Add recurring or design-specific colors, spacing, sizing, radii, shadows, and typography values as Tailwind v4 theme variables in `src/index.css`, then consume their generated semantic utilities.
Arbitrary values are allowed only when they are inherently data-driven or cannot be represented clearly by a standard utility or reusable theme token.
Prefer existing shadcn UI primitives for supported controls such as buttons, inputs, selects, menus, dialogs, and sheets instead of raw HTML controls.
Do not rewrite generated shadcn internals merely to remove their required arbitrary selectors or positioning values; apply these conventions to application code and project-owned components.

## Component variants and styling consistency

Before adding a page-level `className` to a shared UI control, check whether its visual treatment belongs in the component's existing CVA variant or size API.
Add reusable CVA variants to `src/components/ui/**` for repeated control treatments such as dashboard actions, selected navigation items, table matrices, badges, inputs, and checkboxes.
Page files may use `className` for page-specific layout and positioning, but must not repeat full typography, color, border, radius, height, padding, hover, or focus style bundles for shared controls.
When the same visual treatment is used or expected across multiple pages, update the shared component variant once instead of copying Tailwind classes into every consumer.
Prefer semantic variant names that describe purpose, such as `dashboard-outline`, `nav-item`, or `matrix`, rather than names tied to a single route.
When a Base UI or Radix Button renders a non-button element such as React Router's `Link`, configure the element properly (e.g., via `asChild` or `nativeButton={false}`) so its semantics match the rendered element and no accessibility warnings are produced.
Use the shared `FormDialog` composition for form dialogs instead of repeatedly assembling `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter` in feature code.
Use the shared `TableActionMenu` composition for table-row dot menus instead of repeatedly assembling `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, and `DropdownMenuItem` in page or feature code.
Follow the shadcn TanStack Form pattern for new forms: register the Zod schema through `useForm.validators`, render controls through `form.Field`, and use the shared `Field`, `FieldLabel`, and `FieldError` primitives with `data-invalid` and `aria-invalid` states.

<!-- END:frontend-agent-rules -->