import { hexToRGB } from "../../utils/color";

class StaticColorSchemeFactory {
  constructor(accent) {
    return {
      shade: hexToRGB(accent, 0.1),
      dimPrimary: hexToRGB(accent, 0.7),
      fontTertiary: "#5b5b5b",
      transparent: "transparent",
      static: "white",
      error: "#E53935",
      errorBg: "#E5393520",
      success: "#4F8A10",
      warn: "#FF5722",
      favorite: "#ffd700",
    };
  }
}
export default StaticColorSchemeFactory;
