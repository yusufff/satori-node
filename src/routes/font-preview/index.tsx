import { renderToImage } from "../og/render-to-image";
import type { FastifyPluginAsync } from "fastify";
import fetch from "node-fetch";
import React from "react";
import { Font } from "satori";
import { Readable } from "stream";

const cache = new Map<
  string,
  {
    image: Buffer;
    contentType: string;
  }
>();

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
          fonts,
        }
      );

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
  });
};

export default FontPreview;
