import fonts from "./fonts";
import { Resvg } from "@resvg/resvg-js";
import { ReactElement } from "react";
import satori, { SatoriOptions } from "satori";

export async function renderToImage(
  node: ReactElement,
  options: {
    width?: number;
    height: number;
    debug?: boolean;
    fonts?: SatoriOptions["fonts"];
  }
) {
  const svg = await satori(node, {
    ...options,
    fonts: options.fonts || fonts,
  });

  const w = new Resvg(svg);
  return {
    image: w.render().asPng(),
    contentType: "image/png",
  };
}
