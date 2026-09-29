# Commercial & leisure complex — Fqih Ben Salah

Concept design presentation for a single-storey commercial and leisure building on a plot
next to Marjane in Fqih Ben Salah, Morocco.

**Building:** 7.00 × 50.00 m — 350 m², steel portal frames at 5 m centres, sandwich panel
walls, fully glazed east facade, flat roof.
**Programme:** gaming zone 259 m² (south), fast food 91 m² (north) with a 78 m² terrace.
**Site:** 2 640 m² plot, 39 parking spaces on the Marjane side, one-way circulation.

## What is in the page

| Section | Content |
|---|---|
| 01 | Interactive 3D aerial view — drag to orbit, scroll to zoom, lift the roof |
| 02 | Site plan, 1:400 |
| 03 | Floor plan, 1:150 |
| 04 | East elevation and cross section |
| 05 | Area schedule and construction notes |

## Running it

Everything is static. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

## Publishing on GitHub Pages

1. Create a repository and push these files to the `main` branch.
2. Repository → **Settings** → **Pages**.
3. Source: *Deploy from a branch*, branch `main`, folder `/ (root)`, then **Save**.
4. The site appears at `https://<user>.github.io/<repo>/` after a minute or two.

`.nojekyll` is included so GitHub serves the folders as they are.

## Structure

```
index.html                 markup and section text
assets/css/style.css       sheet layout, typography, drawing conventions
assets/js/drawings.js      SVG site plan, floor plan, elevation, section
assets/js/scene3d.js       three.js 3D view
```

## Editing the drawings

The 2D drawings are generated from a small helper in `drawings.js`. Coordinates are written
in **metres**, with y pointing north, so the drawings stay readable and consistent with the
dimensions:

```js
p.rect(4, 8, 7, 50, 'st-wall');   // building: x=4, y=8, 7 m wide, 50 m long
p.dimH(0, 50, -9.6, '50.00 m');   // dimension line with architectural ticks
```

Colours and line weights live in the `.dw` classes at the end of `style.css`.

## Dependency

three.js r128, loaded from cdnjs. No build step, no package manager.
