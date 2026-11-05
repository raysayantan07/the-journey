import Svg, { Circle, G, Path } from "react-native-svg";
export type IconName =
  | "back"
  | "target"
  | "workout"
  | "settings"
  | "locate"
  | "close"
  | "chevron"
  | "spark"
  | "check"
  | "plus";
export function Icon({
  name,
  size = 24,
  color = "#355347",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const paths: Partial<Record<IconName, string>> = {
    back: "M15 5 8 12 15 19 M8 12 H22",

    settings:
      "M9 3 8 6 5 6 3 9 5 12 3 15 5 18 8 18 9 21 15 21 16 18 19 18 21 15 19 12 21 9 19 6 16 6 15 3Z",
    locate: "M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22",
    close: "M6 6 18 18 M18 6 6 18",
    chevron: "M9 5 16 12 9 19",
    spark: "M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z",
    check: "M5 12 10 17 20 7",
    plus: "M12 5 V19 M5 12 H19",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G
        fill="none"
        stroke={color}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[name] && <Path d={paths[name]} />}
        {name === "workout" && (
          <G transform="rotate(-45 12 12)">
            <Path
              d="M3 10 V14 M6 7 V17 M18 7 V17 M21 10 V14 M6 12 H18"
              strokeWidth="2.3"
            />
          </G>
        )}
        {name === "settings" && <Circle cx="12" cy="12" r="3.4" />}
        {name === "target" && (
          <>
            <Circle cx="11" cy="13" r="8" />
            <Circle cx="11" cy="13" r="4" />
            <Path d="M11 13 21 3 M16 3 H21 V8" />
          </>
        )}
        {name === "locate" && (
          <>
            <Circle cx="12" cy="12" r="7" />
            <Circle cx="12" cy="12" r="2" />
          </>
        )}
      </G>
    </Svg>
  );
}
