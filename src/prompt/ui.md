# Create a Single Self-Contained IELTS Writing Test Component

Create **ONE single React/Next.js component** that recreates the entire IELTS Computer-Based Writing Test interface shown in the reference image. Do **NOT** split the UI into multiple reusable components. Everything should be contained inside **one file** (for example: `WritingTest.tsx` or `WritingTest.jsx`).

The component should be production-ready, responsive, and visually polished.

---

# Requirements

## Single Component Only

Everything must exist inside **one component**, including:

- Top Navigation
- Question Panel
- Resizable Divider
- Writing Panel
- Bottom Navigation
- Timer
- Word Counter
- Submit Buttons
- Internal State
- Event Handlers
- Responsive Logic

**Do not create:**

- Header component
- Sidebar component
- Timer component
- Editor component
- Navigation component
- Separate hooks
- Separate utilities

Everything must remain inside a single file.

---

# Tech Stack

- Next.js App Router
- React
- TailwindCSS
- Shadcn UI
- Lucide React Icons
- Framer Motion (subtle animations only)

---

# Overall Layout

The page fills the entire viewport.

```
┌────────────────────────────────────────────────────────────────────┐
│                           Top Navigation                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Question Panel      │  Resize Divider │    Writing Panel          │
│                       │                 │                           │
│                       │                 │                           │
│                       │                 │                           │
│                       │                 │                           │
│                       │                 │                           │
├────────────────────────────────────────────────────────────────────┤
│                     Bottom Navigation                              │
└────────────────────────────────────────────────────────────────────┘
```

Use CSS Grid

```
grid-template-columns:
1fr
10px
1fr
```

Panels should occupy full remaining height.

---

# Top Navigation

Height

```
72px
```

White background

Bottom border

```
1px solid #ECECEC
```

Very subtle shadow.

Layout

```
Left
Center
Right
```

---

## Left

Back Arrow

Text

```
Exit
```

Question title

```
Pie Chart / Mixed Graph - 2
```

Subtitle

```
Sectional Test • 20 min
```

---

## Center

Green Clock Icon

Countdown

```
00:19:26 remaining
```

---

## Right

Outlined Submit Button

Rounded

---

# Question Panel

White card

Rounded

Large scrollable area.

Padding

```
32px
```

Contains

- Instructions
- Images
- Graphs
- Tables

Images should scale responsively.

---

# Resize Divider

Between panels.

Contains

- thin line
- draggable handle

Cursor

```
col-resize
```

Dragging should resize both panels.

---

# Writing Panel

White card

Rounded

Contains

Top Right

```
Write at least 150 words
```

Large textarea

Placeholder

```
Write here...
```

Live word count

Floating Submit Button

---

# Bottom Navigation

White bar

Height

```
78px
```

Contains

Left

```
☐ Mark for Review
```

Right

Current Question

```
1
```

Rounded blue square.

---

# Functionality

Implement everything inside the same component.

### Countdown Timer

Live updating timer.

---

### Word Counter

Counts words while typing.

---

### Autosave

Auto-save every few seconds using localStorage.

---

### Resizable Panels

Allow dragging divider.

---

### Keyboard Shortcuts

Ctrl + Enter

Submit

---

# Styling

Use

- TailwindCSS
- Inter Font
- Rounded cards
- Thin borders
- Soft shadows
- Modern spacing

---

# Colors

Background

```
#FAFAFB
```

Cards

```
#FFFFFF
```

Border

```
#E8E8EC
```

Primary

```
#4F46E5
```

Success

```
#166534
```

Text

```
#111827
```

Secondary

```
#6B7280
```

---

# Responsive

Desktop

- Two panels
- Resizable divider

Tablet

- Two panels
- Smaller padding

Mobile

- Stack panels vertically
- Sticky submit button
- Sticky timer

---

# Important

The final output should be **one single React component** with:

- No component splitting
- No external UI files
- No custom hooks
- No utility files
- No separate CSS files

Everything (state, layout, styling, handlers, logic, and JSX) must be contained in **one component file**, while remaining clean, readable, and well-commented.