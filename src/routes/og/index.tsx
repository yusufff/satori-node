import { renderToImage } from "./render-to-image";
import type { FastifyPluginAsync } from "fastify";
import React from "react";
import { Readable } from "stream";

const og: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Querystring: { text?: string } }>(
    "/",
    async (_request, reply) => {
      const text = _request.query.text;

      if (!text) {
        return reply.code(400).send({ error: "Missing text query parameter" });
      }

      try {
        const imageRes = await renderToImage(
          <div
            style={{
              fontSize: 128,
              background: "white",
              width: "100%",
              height: "100%",
              display: "flex",
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Hello world!
          </div>,
          {
            width: 1200,
            height: 600,
            debug: false,
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
    }
  );
};

export default og;
