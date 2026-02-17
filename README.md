<div align="center">
  <br />
  <h1>🍡 mochi</h1>
  <p><strong>Soft, squishy, expandable toast notifications for vanilla JS.</strong></p>
  <p>
    Inspired by <a href="https://github.com/hiaaryan/sileo">Sileo</a> — rebuilt from the ground up with zero dependencies, no frameworks, and buttery smooth physics.
  </p>
  <br />

![HTML5](https://img.shields.io/badge/vanilla-js-F7DF1E?style=flat-square&logo=javascript&logoColor=000)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-44cc11?style=flat-square)
![Gzipped](https://img.shields.io/badge/gzip-~3kb-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-purple?style=flat-square)

  <br />

  <img src="https://raw.githubusercontent.com/Bill3621/mochi-toast/main/preview.gif" alt="mochi toast demo" width="420" />

  <br />
</div>

---

## ✨ Features

- **Framework-free** — pure vanilla JS + CSS, drop it into any project
- **Gooey expand/collapse** — pill-shaped header smoothly morphs into a full card
- **Swipe to dismiss** — flick toasts upward with rubber-band physics (opt-out per toast)
- **Smooth reflow** — remaining toasts glide up when one is dismissed
- **State transitions** — morph a loading spinner into a success card without remounting
- **Rich content** — embed any HTML inside the expandable body
- **Light & dark themes** — per-toast theming via a single option
- **Tiny footprint** — ~3 KB gzipped, zero dependencies

## 📦 Installation

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/mochi-toast/toast.css" />
<script src="https://unpkg.com/mochi-toast/toast.js"></script>
```

### Manual

Copy `toast.css` and `toast.js` into your project:

```text
your-project/
├── toast.css
├── toast.js
└── ...
```

```html
<link rel="stylesheet" href="toast.css" />
<script src="toast.js"></script>
```

> The viewport element (`#toast-viewport`) is created automatically if it
> doesn't already exist in the DOM.

## 🚀 Quick Start

```html
<script>
    // Simple success toast
    Toast.create({
        type: "success",
        title: "Changes Saved",
        description: "All your changes have been saved successfully.",
        autoDismiss: 4000,
    });
</script>
```

## 📖 API

### `Toast.create(options)`

Creates and shows a new toast. Returns a **toast API object**.

| Option         | Type       | Default   | Description                                                         |
| -------------- | ---------- | --------- | ------------------------------------------------------------------- |
| `type`         | `string`   | `"info"`  | `"info"` · `"success"` · `"error"` · `"loading"`                    |
| `title`        | `string`   | `""`      | Header text                                                         |
| `description`  | `string`   | `""`      | Body paragraph text                                                 |
| `theme`        | `string`   | `"light"` | `"light"` or `"dark"`                                               |
| `actionLabel`  | `string`   | `null`    | Adds a CTA button with this label                                   |
| `onAction`     | `function` | `null`    | Callback when the action button is clicked — receives the toast API |
| `richHTML`     | `string`   | `null`    | Arbitrary HTML injected into the body                               |
| `expandDelay`  | `number`   | `800`     | ms before the body auto-expands                                     |
| `autoDismiss`  | `number`   | `0`       | ms before auto-dismiss (0 = manual only)                            |
| `swipeDismiss` | `boolean`  | `true`    | Allow swiping up to dismiss                                         |

### Toast API Object

The object returned by `Toast.create()`:

| Method                                    | Description                                   |
| ----------------------------------------- | --------------------------------------------- |
| `api.dismiss()`                           | Dismiss the toast with exit animation         |
| `api.expand()`                            | Expand the body section                       |
| `api.collapse()`                          | Collapse the body back to the pill header     |
| `api.setTitle(text, color?)`              | Update the header title                       |
| `api.setIcon(svgHTML, animate?)`          | Replace the icon — pass `true` to pop-animate |
| `api.setBody(html)`                       | Replace the body content entirely             |
| `api.replaceBtn(label, bgColor?, color?)` | Update the action button (and disable it)     |

### Built-in Icons

Access via `Toast.ICONS`:

```js
Toast.ICONS.info;
Toast.ICONS.success;
Toast.ICONS.successDark;
Toast.ICONS.error;
Toast.ICONS.spinner;
```

### Built-in Colors

Access via `Toast.COLORS`:

```js
Toast.COLORS.light.success; // "#16A34A"
Toast.COLORS.dark.success; // "#4ADE80"
```

## 🧑🍳 Recipes

### Error toast

```js
Toast.create({
    type: "error",
    title: "Something Went Wrong",
    description: "We couldn't save your changes. Please try again.",
    autoDismiss: 5000,
});
```

### Toast with action button

```js
Toast.create({
    type: "info",
    title: "File Uploaded",
    description: "Share it with your team?",
    actionLabel: "Share Now",
    onAction: (api) => {
        api.replaceBtn("Link Copied!", "#DCFCE7", "#16A34A");

        setTimeout(() => {
            api.setTitle("Link Copied", "#16A34A");
            api.setIcon(Toast.ICONS.success, true);
            api.collapse();
            setTimeout(() => api.dismiss(), 2500);
        }, 700);
    },
});
```

### Loading → Success transition

```js
const t = Toast.create({
    type: "loading",
    title: "Saving...",
    expandDelay: 999999, // don't auto-expand
});

// Later, when the async work finishes:
t.setTitle("Saved!", "#16A34A");
t.setIcon(Toast.ICONS.success, true);
setTimeout(() => t.dismiss(), 2000);
```

### Loading → Rich content card

```js
const t = Toast.create({
    type: "loading",
    title: "Booking Flight",
    expandDelay: 999999,
});

fetchBooking().then((html) => {
    t.setTitle("Booking Confirmed", "#4ADE80");
    t.setIcon(Toast.ICONS.successDark, true);
    t.el.dataset.theme = "dark";

    setTimeout(() => {
        t.setBody(html);
        t.expand();
    }, 500);
});
```

### Dark theme

```js
Toast.create({
    type: "success",
    title: "Confirmed",
    theme: "dark",
    description: "Your reservation is locked in.",
    autoDismiss: 4000,
});
```

### Disable swipe dismiss

```js
Toast.create({
    type: "info",
    title: "Important Notice",
    description: "This toast can only be dismissed programmatically.",
    swipeDismiss: false,
    autoDismiss: 6000,
});
```

## 🎨 Customization

Override any CSS variable or class to match your design system:

```css
/* Custom content width */
.toast-content {
    width: 420px;
}

/* Custom background */
.toast-bg {
    background: #1a1a2e;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Custom button style */
.toast-btn.style-info {
    background: #6366f1;
    color: #fff;
    border-radius: 999px;
}
```

## 🙏 Credits

- Heavily inspired by [Sileo](https://github.com/hiaaryan/sileo) by
  [@hiaaryan](https://github.com/hiaaryan) — a beautiful React toast
  library. Mochi is a framework-free reimagination of that same design
  philosophy.

## 📄 License

[MIT](LICENSE) — use it however you like.
