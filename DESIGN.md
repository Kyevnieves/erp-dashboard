---
title: ERP Dashboard - Mi PyME DESIGN
version: 1.0.0
last_updated: 2026-07-17
---

# Design System — ERP Dashboard Mi PyME

## Colors

### Light Mode
| Token | HSL | OKLCH | Usage |
|-------|------|-------|-------|
| --background | 0 0% 100% | oklch(1 0 0) | Page bg |
| --foreground | 222.2 84% 4.9% | oklch(0.129 0.042 264) | Body text |
| --primary | 221.2 83.2% 53.3% | oklch(0.546 0.245 262) | Buttons, links, active states |
| --primary-foreground | 210 40% 98% | oklch(0.97 0 0) | Text on primary |
| --sidebar | 222.2 84% 4.9% | oklch(0.129 0.042 264) | Sidebar bg |
| --muted | 210 40% 96.1% | oklch(0.97 0.005 264) | Subtle backgrounds |

### Dark Mode
All .dark variant tokens invert for readability in low-light environments.

## Typography
- **Family:** system-ui, -apple-system, sans-serif (performance)
- **Scale:** text-xs (12px) → text-4xl (36px) via Tailwind
- **Body:** text-sm (14px) for dense dashboard data
- **Headings:** font-semibold, tracking-tight
- **Line length:** capped at 75ch on prose content

## Component Architecture
- **Shadcn/ui** primitives: Button, Card, Dialog, Badge, Avatar, Input, Label, Separator
- **Layout:** sidebar navigation + sticky header + scrollable main area
- **Feedback:** React Toastify for all CRUD and system notifications
- **Charts:** Recharts (BarChart, PieChart with donut variant)

## Spacing
- 4px base unit (Tailwind spacing scale)
- Section padding: p-4 (mobile) → p-6 (tablet) → p-8 (desktop)
- Card gaps: gap-4 grid (mobile) → gap-6 (desktop)

## Motion
- Sidebar: translate-x with 300ms duration, ease-in-out
- Dialog: radix-ui default fade + scale animation
- Transitions: color, bg-color, border-color at 150ms ease
- Reduced motion respected via Tailwind's motion-safe/motion-reduce

## Responsive Breakpoints
- Mobile: 0–639px (single column, sidebar overlay)
- Tablet: 640–1023px (2 columns)
- Desktop: 1024px+ (sidebar visible, multi-column grids)
