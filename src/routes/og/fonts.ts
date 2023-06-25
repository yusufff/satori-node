import fs from "fs";
import path from "path";

const NotoSansDir = path.join(__dirname, "../../assets/fonts/Noto_Sans");
const NotoSansFiles = fs.readdirSync(NotoSansDir);

const weights = [
  {
    name: "Thin",
    weight: 100,
  },
  {
    name: "ExtraLight",
    weight: 200,
  },
  {
    name: "Light",
    weight: 300,
  },
  {
    name: "Regular",
    weight: 400,
  },
  {
    name: "Italic",
    weight: 400,
  },
  {
    name: "Medium",
    weight: 500,
  },
  {
    name: "SemiBold",
    weight: 600,
  },
  {
    name: "Bold",
    weight: 700,
  },
  {
    name: "ExtraBold",
    weight: 800,
  },
  {
    name: "Black",
    weight: 900,
  },
] as const;

export default NotoSansFiles.map((file) => ({
  name: file.split("-")[0],
  data: fs.readFileSync(path.join(NotoSansDir, file)),
  weight: weights.find((weight) => weight.name === file.split("-")[1])?.weight,
  style: file.includes("Italic") ? "italic" : ("normal" as "italic" | "normal"),
}));
