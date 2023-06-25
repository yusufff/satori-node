import closeWithGrace from "close-with-grace";
import * as dotenv from "dotenv";
import Fastify from "fastify";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const app = Fastify({
  logger: !isProduction,
});

app.register(import("./app"));

const closeListeners = closeWithGrace({ delay: 500 }, async (opts: any) => {
  if (opts.err) {
    app.log.error(opts.err);
  }

  await app.close();
});

app.addHook("onClose", async (_instance, done) => {
  closeListeners.uninstall();
  done();
});

app.listen({
  port: Number(process.env.PORT ?? 3000),
  host: process.env.SERVER_HOSTNAME ?? "127.0.0.1",
});

app.ready((err: Error) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  app.log.info(`Server listening on port ${Number(process.env.PORT ?? 3000)}`);
});

export { app };
