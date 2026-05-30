# `<pip-mascot>` — drop-in mascot for SellPilot

Self-contained Web Component. **One JS file, zero dependencies.** Works in plain HTML, React, Vue, Angular, Svelte — anywhere a `<custom-element>` can render.

```
pip-mascot/
├── pip-mascot.js   ← drop-in component (~10KB)
├── demo.html       ← live playground + usage examples
└── README.md       ← this file
```

## Install

Copy `pip-mascot.js` into your app's static assets, then include it once:

```html
<script src="/path/to/pip-mascot.js"></script>
```

That's it. The custom element `<pip-mascot>` is now defined globally.

## Use

```html
<pip-mascot pose="wave" size="160"></pip-mascot>
<pip-mascot pose="celebrate"></pip-mascot>
<pip-mascot autocycle="3000"></pip-mascot>
```

## Poses

| pose         | when to use                          |
|--------------|--------------------------------------|
| `wave`       | onboarding · greeting · idle in chat |
| `think`      | loading · searching · "typing"       |
| `point`      | product recommendation               |
| `celebrate`  | checkout success · achievement       |
| `sleep`      | idle · empty state · empty cart      |
| `oops`       | error · 404 · failed action          |

## Attributes

| attribute    | values                                          | default |
|--------------|-------------------------------------------------|---------|
| `pose`       | `wave \| think \| point \| celebrate \| sleep \| oops` | `wave` |
| `size`       | number (px) or any CSS length                   | `100%`  |
| `speed`      | `0.3 – 3` — animation speed multiplier          | `1`     |
| `autocycle`  | ms between auto pose changes                    | off     |
| `no-shadow`  | boolean attribute — hides ground shadow         | off     |

## Imperative API

```js
const el = document.querySelector('pip-mascot');

el.pose = 'celebrate';                       // set pose
el.cycle(['wave', 'think', 'point'], 2500);  // cycle a custom list
el.stopCycle();

el.addEventListener('pose-change', e => {
  console.log('Now:', e.detail.pose);
});
```

## Use in React

```jsx
// once, in index.html or via a side-effect import
// <script src="/pip-mascot.js"></script>

export function Mascot({ pose = 'wave', size = 160 }) {
  return <pip-mascot pose={pose} size={size} />;
}
```

> If TypeScript complains, add to your `global.d.ts`:
> ```ts
> declare namespace JSX {
>   interface IntrinsicElements {
>     'pip-mascot': any;
>   }
> }
> ```

## Use in Vue

```vue
<template>
  <pip-mascot :pose="pose" size="160" />
</template>
```

Tell Vue to treat it as a custom element (in `vite.config.js`):
```js
template: { compilerOptions: { isCustomElement: tag => tag === 'pip-mascot' } }
```

## Customizing

- **Color** — Pip uses a CSS gradient defined inside the component (indigo → violet → pink). Open `pip-mascot.js`, find the `<linearGradient id="pip-grad">` and change the stops to your brand colors.
- **Speed** — Use the `speed` attribute (`speed="0.5"` = slower, `speed="2"` = faster).
- **Sizing** — Set `size` or just CSS: `pip-mascot { width: 200px; height: 200px; }`.
- **Reduced motion** — Animations auto-pause when `prefers-reduced-motion: reduce` is set. No extra work needed.

## Demo

Open `demo.html` to see the playground, all six poses running simultaneously, and three in-context examples (chat widget, empty state, success screen).
