// theme/system.ts
import { createSystem, defaultBaseConfig } from "@chakra-ui/react";

import { tokens } from "./tokens";
import { recipes } from "./recipes";
import { textStyles } from "./text-styles";
import { layerStyles } from "./layer-styles";
import { keyframes } from "./keyframes";
import { globalCss } from "./global-css";

export const system = createSystem(defaultBaseConfig, {
  tokens,
  recipes,
  textStyles,
  layerStyles,
  keyframes,
  globalCss,
} as any);
