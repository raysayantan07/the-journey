import type { ImageSourcePropType } from "react-native";
import type { Tier } from "./model";

// Shared by every tree of a given tier/shape; decoded ahead in the overscan window.
export const treeAssets: Record<
  Tier,
  [ImageSourcePropType, ImageSourcePropType]
> = {
  base: [
    require("../../assets/trees/base-0.png"),
    require("../../assets/trees/base-1.png"),
  ],
  solid: [
    require("../../assets/trees/solid-0.png"),
    require("../../assets/trees/solid-1.png"),
  ],
  excellent: [
    require("../../assets/trees/excellent-0.png"),
    require("../../assets/trees/excellent-1.png"),
  ],
  extraordinary: [
    require("../../assets/trees/extraordinary-0.png"),
    require("../../assets/trees/extraordinary-1.png"),
  ],
  champion: [
    require("../../assets/trees/champion-0.png"),
    require("../../assets/trees/champion-1.png"),
  ],
  legendary: [
    require("../../assets/trees/legendary-0.png"),
    require("../../assets/trees/legendary-1.png"),
  ],
};
