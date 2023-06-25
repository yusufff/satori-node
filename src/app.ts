import type { AutoloadPluginOptions } from "@fastify/autoload";
import AutoLoad from "@fastify/autoload";
import type { FastifyPluginAsync } from "fastify";
import { join } from "path";

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    indexPattern: /^index(\.ts|\.tsx|\.js|\.cjs|\.mjs)$/i,
    options: opts,
  });
};

export default app;
export { app };
