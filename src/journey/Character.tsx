import { Platform } from "react-native";
import {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";
import { positionForProgress, type CharacterState } from "./model";
import { useAmbientPhase } from "../components/useAmbientPhase";
const AnimatedGroup = Animated.createAnimatedComponent(G);
const isWeb = Platform.OS === "web";
export function Character({
  travel,
  state,
  facing,
}: {
  travel: SharedValue<number>;
  state: CharacterState;
  facing: SharedValue<number>;
}) {
  const phase = useAmbientPhase(
    state === "running" ? 520 : state === "jogging" ? 780 : 2800,
  );
  const resting = ["sleeping", "vacation", "sick", "injury", "broken"].includes(
    state,
  );
  const props = useAnimatedProps(() => {
    const step = Math.max(0, travel.value);
    const mix = step - Math.floor(step);
    const { x, y } = positionForProgress(step);
    const moving = mix > 0.01 && mix < 0.99;
    const hop = moving && state !== "flying" ? Math.sin(mix * Math.PI) * 19 : 0;
    const bounce =
      state === "flying"
        ? 12 + Math.sin(phase.value) * 6
        : resting
          ? Math.sin(phase.value) * 1.2
          : Math.abs(Math.sin(phase.value)) * (state === "standing" ? 2 : 5);
    const direction = resting ? 1 : facing.value;
    const dx = x - 48 + (direction < 0 ? 96 : 0);
    const dy = y - 111 - hop - bounce;
    return {
      opacity: 1,
      ...(isWeb
        ? { transform: `matrix(${direction} 0 0 1 ${dx} ${dy})` }
        : { matrix: [direction, 0, 0, 1, dx, dy] }),
    };
  });
  const limbProps = useAnimatedProps(() => {
    const angle =
      resting || state === "standing" || state === "flying"
        ? 0
        : Math.sin(phase.value) * (state === "running" ? 0.24 : 0.14);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const dx = 48 - 48 * c + 84 * s;
    const dy = 84 - 48 * s - 84 * c;
    return {
      opacity: 1,
      ...(isWeb
        ? { transform: `matrix(${c} ${s} ${-s} ${c} ${dx} ${dy})` }
        : { matrix: [c, s, -s, c, dx, dy] }),
    };
  });
  // Artwork stays independent of progression: swap this SVG without changing route/camera logic.
  return (
    <AnimatedGroup animatedProps={props} pointerEvents="none">
      {state === "flying" && (
        <G>
          <Ellipse cx="48" cy="103" rx="38" ry="16" fill="url(#glow)" />
          <Path
            d="M29 70 Q-6 38 10 80 L30 89 M67 70 Q102 38 86 80 L66 89"
            fill="#F8E9BC"
            stroke="#DBC68E"
            strokeWidth="2"
          />
        </G>
      )}
      {state === "injury" ? (
        <G>
          <Ellipse
            cx="48"
            cy="108"
            rx="33"
            ry="10"
            fill="#607A5A"
            opacity=".14"
          />
          <Path
            d="M34 82 Q49 69 60 84 L63 99 80 101 84 108 58 111 45 99 33 102Z"
            fill="url(#coat)"
          />
          <Path
            d="M61 101 78 102 79 109 60 110Z"
            fill="#F4EDDB"
            stroke="#D2C8AF"
          />
          <Path d="M65 102 V109 M71 102 V109" stroke="#D8CEBA" />
          <Path
            d="M28 88 Q19 104 32 109 L49 107"
            fill="none"
            stroke="#456458"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <Ellipse cx="43" cy="64" rx="22" ry="21" fill="url(#face)" />
          <Path
            d="M20 58 Q17 34 42 35 Q67 35 67 58 Q43 46 20 58Z"
            fill="url(#hat)"
          />
          <Path
            d="M18 56 Q44 46 70 57"
            stroke="#4E8267"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Path
            d="M30 64 Q34 68 37 64 M48 64 Q52 68 55 64 M38 76 Q43 79 48 75"
            fill="none"
            stroke="#805F4C"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <Path
            d="M30 85 24 99 M57 84 60 96"
            stroke="#E2A37A"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </G>
      ) : resting ? (
        <G>
          <Ellipse
            cx="48"
            cy="106"
            rx="35"
            ry="10"
            fill="#607A5A"
            opacity=".14"
          />
          <Rect x="10" y="88" width="62" height="22" rx="11" fill="#E4D8B6" />
          <Path
            d="M40 84 Q75 68 84 99 L69 109 36 103Z"
            fill={
              state === "sick"
                ? "#A3C2D2"
                : state === "vacation"
                  ? "#DDB47F"
                  : "#80AA8E"
            }
          />
          <Path
            d="M47 88 71 106 M56 83 80 101"
            stroke="#C9DFBF"
            strokeWidth="3"
            opacity=".5"
          />
          <Ellipse
            cx="30"
            cy="88"
            rx="21"
            ry="18"
            fill="url(#face)"
            transform="rotate(-12 30 88)"
          />
          <Path
            d="M10 82 Q8 62 31 64 Q49 66 47 82 Q26 71 10 82Z"
            fill="url(#hat)"
          />
          <Path
            d="M6 80 Q23 71 43 77"
            stroke="#416C56"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Path
            d="M20 87 Q23 91 26 87 M34 86 Q37 90 40 86"
            stroke="#5A5140"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          {state === "vacation" && (
            <G>
              <Path
                d="M16 85 28 83 28 91 18 91Z M32 83 43 81 43 89 34 90Z"
                fill="#506B5B"
              />
              <Path d="M27 85 H33" stroke="#506B5B" strokeWidth="2" />
            </G>
          )}
          {state === "broken" ? (
            <G>
              <Path
                d="M25 90 Q18 102 25 103 Q31 101 25 90 M38 89 Q32 102 39 101 Q44 100 38 89"
                fill="#96C9DB"
              />
              <Path d="M28 97 Q31 94 34 96" stroke="#AA7161" fill="none" />
            </G>
          ) : (
            <Path
              d="M28 95 Q31 98 34 95"
              stroke="#A47B61"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {state === "sick" && (
            <Rect
              x="21"
              y="78"
              width="18"
              height="4"
              rx="2"
              fill="#FDF5D7"
              transform="rotate(-8 21 78)"
            />
          )}
          <SvgText x="63" y="58" fill="#88A18A" fontSize="13" fontWeight="600">
            {state === "sleeping" ? "z" : state === "vacation" ? "·" : ""}
          </SvgText>
          {state === "sleeping" && (
            <SvgText
              x="75"
              y="43"
              fill="#B1BDA4"
              fontSize="10"
              fontWeight="600"
            >
              z
            </SvgText>
          )}
        </G>
      ) : (
        <G>
          <Ellipse
            cx="48"
            cy="109"
            rx="25"
            ry="9"
            fill="#607A5A"
            opacity=".15"
          />
          <AnimatedGroup animatedProps={limbProps}>
            <Path
              d="M35 89 30 105 Q33 113 44 108 L47 91 M51 90 54 106 Q64 112 69 105 L62 88"
              fill="#405C53"
            />
            <Path
              d="M30 106 Q38 108 43 105 M56 107 Q62 110 69 106"
              fill="none"
              stroke="#E6D9B6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </AnimatedGroup>
          <Rect
            x="58"
            y="61"
            width="17"
            height="27"
            rx="8"
            fill="#8D9A67"
            transform="rotate(-8 58 61)"
          />
          <Path
            d="M35 58 Q48 52 61 61 L66 87 Q51 100 30 87Z"
            fill="url(#coat)"
          />
          <Path
            d="M38 59 35 87 M58 62 62 85"
            stroke="#F4CD9C"
            strokeWidth="3"
          />
          <AnimatedGroup animatedProps={limbProps}>
            <Path
              d={
                state === "running"
                  ? "M34 64 Q19 62 24 49 M62 66 Q77 76 72 85"
                  : "M33 65 Q22 74 27 84 M64 66 Q75 70 71 81"
              }
              stroke="#D99166"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <Circle
              cx={state === "running" ? 24 : 27}
              cy={state === "running" ? 49 : 84}
              r="5"
              fill="#F3CCAA"
            />
            <Circle cx="71" cy="82" r="5" fill="#F3CCAA" />
          </AnimatedGroup>
          <Ellipse cx="48" cy="45" rx="24" ry="23" fill="url(#face)" />
          <Ellipse cx="25" cy="47" rx="5" ry="7" fill="#ECC29D" />
          <Path
            d="M24 36 Q18 13 44 12 Q71 10 73 35 Q49 25 24 36Z"
            fill="url(#hat)"
          />
          <Path
            d="M21 33 Q46 22 75 33 L82 39 Q64 43 47 38 Q30 35 21 38Z"
            fill="#5A9074"
          />
          <Path
            d="M30 24 Q35 16 45 16"
            stroke="#B9D3AD"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity=".8"
          />
          <Ellipse cx="43" cy="47" rx="2.1" ry="3" fill="#485247" />
          <Ellipse cx="60" cy="46" rx="2.1" ry="3" fill="#485247" />
          <Circle cx="37" cy="54" r="4" fill="#ECA997" opacity=".55" />
          <Circle cx="65" cy="53" r="3.5" fill="#ECA997" opacity=".55" />
          <Path
            d="M48 56 Q53 61 58 55"
            fill="none"
            stroke="#A47259"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Path d="M42 65 48 73 56 64" fill="#F6DEAF" />
          <Path d="M48 73 V90" stroke="#B97152" strokeWidth="1.5" />
          <Circle cx="50" cy="79" r="1.5" fill="#FBE1B5" />
        </G>
      )}
    </AnimatedGroup>
  );
}
