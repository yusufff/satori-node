import fonts from "./fonts";
import { Resvg } from "@resvg/resvg-js";
import { ReactElement } from "react";
import satori from "satori";

type Options = {
  width: number;
  height: number;
  debug: boolean;
};

export async function renderToImage(
  node: ReactElement,
  options: Options = {
    width: 1200,
    height: 630,
    debug: !1,
  }
) {
  const svg = await satori(node, {
    width: options.width,
    height: options.height,
    debug: options.debug,
    fonts: [...fonts],
  });

  const w = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: options.width,
    },
  });
  return {
    image: w.render().asPng(),
    contentType: "image/png",
  };
}
