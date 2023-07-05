# Satori Node

![Satori on Node](https://satori-node.fly.dev/og?text=Running%20Satori%20on%20Node)

This is an example node project running [Satori](https://github.com/vercel/satori) on a Node server with [Fastify](https://www.fastify.io/)

## Why?

Vercel only supports [Edge Runtime](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation#limits) for its OG library.

[Satori](https://github.com/vercel/satori) gives you only the building block for generating dynamic images on the fly. It only converts HTML and CSS to SVG.

This repo creates SVG from HTML and CSS using [Satori](https://github.com/vercel/satori), then converts that SVG to PNG using [resvg](https://github.com/RazrFalcon/resvg), and then streams that PNG using [Fastify](https://www.fastify.io/)

## Development

```sg
# Clone the repo
git clone https://github.com/yusufff/satori-node

# Install
yarn install

# Run
yarn dev
```

This will start the development server.

Go to `http://localhost:3000/og?text=Hello` to see the image.

The source file for the generated image is located at `src/routes/og/index.tsx`

## Production

```sg
yarn build:prod
yarn start:prod
```

This will generate and start a production build.

## Examples

You can try out the Vercel's [Open Graph (OG) Image Examples](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation/og-image-examples)

### Basic server cache for the generated images

```tsx
import { renderToImage } from "./render-to-image";
import type { FastifyPluginAsync } from "fastify";
import React from "react";
import { Readable } from "stream";

// Init a cache map
const cache = new Map<
  string,
  {
    image: Buffer;
    contentType: string;
  }
>();

const og: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Querystring: { text?: string } }>(
    "/",
    async (_request, reply) => {
      const text = _request.query.text;

      if (!text) {
        return reply.code(400).send({ error: "Missing text query parameter" });
      }

      // Return the cached image if it exists
      const cacheHit = cache.get(_request.url);
      if (cacheHit) {
        const stream = new Readable({
          read() {
            this.push(cacheHit.image);
            this.push(null);
          },
        });

        reply.type(cacheHit.contentType);
        return reply.send(stream);
      }

      try {
        const imageRes = await renderToImage(
          <div
            style={{
              fontSize: 100,
              background: "white",
              width: "100%",
              height: "100%",
              display: "flex",
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {text}
          </div>,
          {
            width: 1200,
            height: 600,
            debug: false,
          }
        );

        // Cache the image
        cache.set(_request.url, {
          image: imageRes.image,
          contentType: imageRes.contentType,
        });

        const stream = new Readable({
          read() {
            this.push(imageRes.image);
            this.push(null);
          },
        });

        reply.type(imageRes.contentType);
        return reply.send(stream);
      } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default og;
```

### Google Font Preview

```tsx
import { renderToImage } from "../og/render-to-image";
import type { FastifyPluginAsync } from "fastify";
import fetch from "node-fetch";
import React from "react";
import { Font } from "satori";
import { Readable } from "stream";

const FontPreview: FastifyPluginAsync = async (
  fastify,
  _opts
): Promise<void> => {
  fastify.get<{
    Querystring: { font?: string; color?: string; size?: string };
  }>("/", async (_request, reply) => {
    const { font, color, size } = _request.query;

    const fontSize = size ? parseInt(size) : 100;

    if (!font) {
      return reply.code(400).send({ error: "Missing font query parameter" });
    }

    try {
      const url = new URL("https://www.googleapis.com/webfonts/v1/webfonts");
      url.searchParams.set("family", font);
      url.searchParams.set("key", process.env.GCLOUD_API_KEY ?? "");
      const fontReq = await fetch(url.toString());
      const fontRes = (await fontReq.json()) as google.fonts.WebfontList & {
        error: { code: number };
      };

      if (fontRes?.error) {
        return reply.code(400).send({ error: "Invalid font name" });
      }

      const fontFamily = fontRes.items[0].family;
      const fontFile = fontRes.items[0].files.regular;
      const fontBuffer = await fetch(fontFile).then((res) => res.buffer());

      const fonts: Font[] = [
        {
          name: fontFamily,
          data: fontBuffer,
          weight: 400,
          style: "normal",
        },
      ];

      const imageRes = await renderToImage(
        <div
          style={{
            fontSize: fontSize,
            width: "100%",
            height: "100%",
            display: "flex",
            textAlign: "left",
            color: color ?? "black",
            paddingBottom: fontSize * 0.2,
          }}
        >
          {fontFamily}
        </div>,
        {
          height: fontSize + fontSize * 0.2,
          debug: false,
          fonts,
        }
      );

      const stream = new Readable({
        read() {
          this.push(imageRes.image);
          this.push(null);
        },
      });

      reply.type(imageRes.contentType);
      return reply.send(stream);
    } catch (err) {
      console.log(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });
};

export default FontPreview;
```
