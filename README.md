# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Pen Data

The public pen search reads `public/data/pens.json`.

To rebuild candidate data from Amazon product pages:

```sh
npm run pens:amazon
```

By default, the generator uses the existing Manas-style `public/data/pens.json` brand/model list as the search seed and only accepts trusted stationery manufacturers. It also merges the manually maintained target URLs in `scripts/amazon-pen-target-urls.txt` for important models that should not depend on Amazon search ranking.

This writes:

- `public/data/pens.amazon.generated.json`: same shape as `pens.json`, containing only items whose product page has strong evidence for a body length of 130mm or less.
- `public/data/pens.amazon-report.json`: accepted/rejected rows with extracted evidence, so the source line can be checked before replacing `pens.json`.

The generator intentionally rejects rows when only package dimensions are found, when the length is over 130mm, or when the product page does not clearly expose the pen body length. If Amazon blocks automated access, collect product URLs manually and run:

```sh
node scripts/build-amazon-pen-data.mjs --urls path/to/product-urls.txt
```
