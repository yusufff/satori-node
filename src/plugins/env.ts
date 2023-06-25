import type { FastifyEnvOptions } from "@fastify/env";
import env from "@fastify/env";
import fp from "fastify-plugin";

const schema = {
  type: "object",
  required: ["PORT"],
  properties: {
    PORT: {
      type: "string",
      default: 3000,
    },
  },
};

const options = {
  confKey: "config",
  schema,
  dotenv: true,
};

/**
 * @fastify/env Fastify plugin to check environment variables.
 *
 * @see https://github.com/fastify/fastify-env
 */
export default fp<FastifyEnvOptions>(async (fastify) => {
  await fastify.register(env, options);
});
