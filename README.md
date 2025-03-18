## Quick Start

run `npm install`
run `npm run dev`

## Reserved URLS
I (josh) think [data.streetsforall.org](https://data.streetsforall.org) should act as our ~home base~ for data dev projects. Any non-api applications that may otherwise belong to a floating domain or subdomain should instead have a child domain here.

--- Internal ----
`/blog` blog posts
`/about` about page

--- External Apps ----
`/tool` is reserved for any utilities we want to host on this URL
`/app` is reserved for any applications we want to host on this URL
`/analytics` is reserved for a hosted [Umami analytics](https://umami.is/) instance (needs to be set up)
...

## Project Structure

```
├── public/
├── src/
│   ├── components/
│   ├── post_components/ // for now this is where custom components for blog posts go
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

The `src/content/` directory contains "collections" of related Markdown and MDX documents.

