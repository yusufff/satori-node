import type { FastifyEnvOptions } from "@fastify/env";
import env from "@fastify/env";
import fp from "fastify-plugin";

const schema = {
  type: "object",
  properties: {
    PORT: {
      type: "string",
      default: 3000,
    },
    HOST: {
      type: "string",
      default: "127.0.0.1",
    },
    GCLOUD_API_KEY: {
      type: "string",
      default: "",
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
