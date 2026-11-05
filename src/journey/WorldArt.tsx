import React from "react";
import { Platform } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { useAmbientPhase } from "../components/useAmbientPhase";
import {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { themes, type Theme } from "../design/tokens";
import { type Tile, type RewardKind } from "./model";

export function WorldDefs() {
  return (
    <Defs>
      {Object.values(themes).map((t) => (
        <RadialGradient key={t.name} id={`mist-${t.name}`}>
          <Stop offset="0" stopColor={t.mist} stopOpacity=".8" />
          <Stop offset="1" stopColor={t.mist} stopOpacity="0" />
        </RadialGradient>
      ))}
      <RadialGradient id="shadow">
        <Stop offset="0" stopColor="#62765A" stopOpacity=".20" />
        <Stop offset=".55" stopColor="#62765A" stopOpacity=".08" />
        <Stop offset="1" stopColor="#62765A" stopOpacity="0" />
      </RadialGradient>
      <RadialGradient id="glow">
        <Stop offset="0" stopColor="#FFEFB0" stopOpacity=".8" />
        <Stop offset="1" stopColor="#FFEFB0" stopOpacity="0" />
      </RadialGradient>
      <LinearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
        <Stop stopColor="#BCD6A2" />
        <Stop offset="1" stopColor="#71A184" />
      </LinearGradient>
      <LinearGradient id="coat" x1="0" y1="0" x2="1" y2="1">
        <Stop stopColor="#EDB17B" />
        <Stop offset="1" stopColor="#CF7F59" />
      </LinearGradient>
      <LinearGradient id="face" x1="0" y1="0" x2="1" y2="1">
        <Stop stopColor="#FFE5C5" />
        <Stop offset="1" stopColor="#E5B18A" />
      </LinearGradient>
      <LinearGradient id="hat" x1="0" y1="0" x2="1" y2="1">
        <Stop stopColor="#89B79E" />
        <Stop offset="1" stopColor="#467E67" />
      </LinearGradient>
      <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <Stop stopColor="#FFE7A0" />
        <Stop offset="1" stopColor="#CC9850" />
      </LinearGradient>
    </Defs>
  );
}
const roundedDiamond = (s: number) =>
  `M-6 ${-s / 2 + 3} Q0 ${-s / 2} 6 ${-s / 2 + 3} L${s - 6} -3 Q${s} 0 ${s - 6} 3 L6 ${s / 2 - 3} Q0 ${s / 2} -6 ${s / 2 - 3} L${-s + 6} 3 Q${-s} 0 ${-s + 6} -3Z`;
function soften(hex: string, amount: number): string {
  const mix = (channel: number) =>
    Math.round(channel + (246 - channel) * amount)
      .toString(16)
      .padStart(2, "0");
  return (
    "#" + [1, 3, 5].map((i) => mix(parseInt(hex.slice(i, i + 2), 16))).join("")
  );
}
const diamond = (size: number, y = 0) =>
  `0,${y - size / 2} ${size},${y} 0,${y + size / 2} ${-size},${y}`;
function RewardArtwork({
  kind,
  color = "#D8B575",
}: {
  kind: RewardKind;
  color?: string;
}) {
  if (kind === "gateway")
    return (
      <G>
        <Ellipse cy="7" rx="28" ry="11" fill="#617C69" opacity=".12" />
        <Path
          d="M-27 1 V-42 Q0-71 27-42 V1 L15 8 V-36 Q0-53-15-36 V8Z"
          fill={color}
          stroke="#FFF2CA"
          strokeWidth="2"
        />
        <Path d="M-27-42 Q0-71 27-42 L21-35 Q0-55-21-35Z" fill="#F7E8BE" />
        <Path d="M0-62 L4-54 0-46-4-54Z" fill="#FFF7CD" />
        <Path
          d="M-10-13 Q0-23 10-13"
          stroke="#FFF7CD"
          strokeWidth="2"
          fill="none"
        />
      </G>
    );
  if (kind === "trophy")
    return (
      <G>
        <Ellipse cy="7" rx="23" ry="9" fill="#7E774A" opacity=".12" />
        <Path
          d="M-16-36 C-40-43-26-9-10-18 M16-36 C40-43 26-9 10-18"
          fill="none"
          stroke="#D3A45A"
          strokeWidth="6"
        />
        <Path d="M-18-45 H18 L13-22 Q0-5-13-22Z" fill="url(#gold)" />
        <Path d="M-2-17 H4 V-2 H14 V5 H-14 V-2 H-2Z" fill="#C59551" />
        <Path
          d="M-8-39 H-2 L-4-25"
          fill="none"
          stroke="#FFF0BF"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </G>
    );
  if (kind === "collectible")
    return (
      <G>
        <Ellipse cy="5" rx="23" ry="8" fill="#8D79A4" opacity=".15" />
        <Path d="M0-53 17-30 10-5-9 0-19-27Z" fill="#B3A1D6" />
        <Path d="M0-53 2-24-9 0-19-27Z" fill="#DCD0F0" />
        <Path d="M2-24 17-30 10-5-9 0Z" fill="#9681BC" />
        <Path d="M0-53 2-24 17-30Z" fill="#F0E8FC" />
        <Path
          d="M-25-46 v9 m-4-4 h8 M25-20 v8 m-4-4 h8"
          stroke="#B7A2D3"
          strokeWidth="2"
        />
      </G>
    );
  if (kind === "monument")
    return (
      <G>
        <Path d="M-20 0 0-11 20 0 0 11Z" fill="#D6DCCB" />
        <Path d="M-13-6 V-47 L0-55 13-47 V-6 L0 1Z" fill="#D9DEC9" />
        <Path d="M0-55 13-47 V-6 L0 1Z" fill="#AABDA3" />
        <Circle cy="-34" r="7" fill="#EED48A" />
        <Path d="M0-39 2-35 6-34 2-32 0-28-2-32-6-34-2-35Z" fill="#FFF4C6" />
      </G>
    );
  if (kind === "glow")
    return (
      <G>
        <Ellipse cy="-7" rx="49" ry="30" fill="url(#glow)" />
        <Path
          d="M0-44 5-29 20-24 5-19 0-4-5-19-20-24-5-29Z"
          fill="#FFF0AE"
          stroke="#E1BE70"
          strokeWidth="2"
        />
      </G>
    );
  return (
    <G>
      <Ellipse cy="8" rx="29" ry="10" fill="#6E7150" opacity=".15" />
      <Path d="M-25-23 5-37 29-22 0-6Z" fill="#EBC98E" />
      <Path d="M-25-23 0-8 V15 L-25 0Z" fill="#C99663" />
      <Path d="M0-8 29-22 V1 L0 15Z" fill="#AF7950" />
      <Path
        d="M-26-25 Q-21-43-9-41 L20-36 Q30-32 30-22 L0-7Z"
        fill="url(#gold)"
        stroke="#E5C18A"
        strokeWidth="1.5"
      />
      <Path
        d="M-15-34 11-19 V7 M6-36 23-27 V1"
        stroke="#F6E3A9"
        strokeWidth="5"
        fill="none"
      />
      <Path d="M0-7 29-22" stroke="#876342" strokeWidth="2" />
      <Rect
        x="7"
        y="-9"
        width="7"
        height="9"
        rx="2"
        fill="#F9E4A6"
        transform="rotate(-25 7 -9)"
      />
    </G>
  );
}
const AnimatedReward = Animated.createAnimatedComponent(G);
const web = Platform.OS === "web";
export function Reward({ kind, color }: { kind: RewardKind; color?: string }) {
  const phase = useAmbientPhase(3600);
  const props = useAnimatedProps(() => {
    const y = Math.sin(phase.value) * 2;
    return {
      opacity: 1,
      ...(web
        ? { transform: `translate(0 ${y})` }
        : { matrix: [1, 0, 0, 1, 0, y] }),
    };
  });
  return (
    <AnimatedReward animatedProps={props}>
      <RewardArtwork kind={kind} color={color} />
    </AnimatedReward>
  );
}
export const Stone = React.memo(function Stone({
  tile,
  completed,
  selected,
}: {
  tile: Tile;
  completed: boolean;
  selected: boolean;
}) {
  const theme = themes[tile.tier]!;
  const futureBase = !completed && tile.tier === "base";
  const top = futureBase
    ? "#E1E3D8"
    : !completed
      ? soften(theme.top, 0.65)
      : theme.top;
  const left = futureBase
    ? "#BFC7B9"
    : !completed
      ? soften(theme.left, 0.6)
      : theme.left;
  const right = futureBase
    ? "#CDD2C5"
    : !completed
      ? soften(theme.right, 0.6)
      : theme.right;
  const s = tile.size;
  return (
    <G x={tile.x} y={tile.y}>
      <Ellipse cx="6" cy="22" rx={s + 20} ry={s * 0.58} fill="url(#shadow)" />
      {tile.tier === "legendary" && completed && (
        <Ellipse cy="0" rx="80" ry="53" fill="url(#glow)" />
      )}
      {selected && (
        <Ellipse
          cy="0"
          rx={s + 10}
          ry={s * 0.5 + 8}
          fill="none"
          stroke={theme.accent}
          strokeWidth="2"
          strokeDasharray="4 5"
        />
      )}
      <Polygon
        points={`-${s},0 0,${s / 2} 0,${s / 2 + 14} -${s},14`}
        fill={left}
      />
      <Polygon
        points={`0,${s / 2} ${s},0 ${s},14 0,${s / 2 + 14}`}
        fill={right}
      />
      <Path
        d={roundedDiamond(s)}
        fill={top}
        stroke={futureBase ? "#EAEBE2" : theme.light}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Polygon
        points={diamond(s - 7, -1)}
        fill="none"
        stroke={completed ? theme.light : "#EFF0E8"}
        strokeWidth="1"
        opacity=".65"
      />
      {!tile.milestone && tile.id !== 0 && (
        <SvgText
          x="0"
          y="6"
          textAnchor="middle"
          fontSize="12"
          fontFamily="sans-serif"
          fontWeight="600"
          fill={completed ? theme.accent : "#A2AF9E"}
          opacity=".8"
        >
          {tile.id}
        </SvgText>
      )}
      {tile.id === 0 && (
        <G opacity=".5">
          <Path
            d="M-17-3 Q-7-10-3-3 L4 5 Q9 10 15 5"
            fill="none"
            stroke={theme.accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
      )}
      {tile.milestone && (
        <G x="-32" y="-8">
          <Reward
            kind={tile.milestone.kind}
            color={theme.name === "base" ? "#D3BB87" : theme.top}
          />
        </G>
      )}
      {tile.milestone && (
        <G y="40">
          <Rect x="-24" y="-9" width="48" height="19" rx="9.5" fill="#FFFEF9" />
          <SvgText
            textAnchor="middle"
            y="5"
            fontSize="10"
            fontWeight="700"
            fill={theme.accent}
          >
            {tile.id}
          </SvgText>
        </G>
      )}
      {completed && tile.id % 3 === 1 && (
        <G x="-22" y="-5" opacity=".5">
          <Circle r="1.8" fill="#F5F7D5" />
          <Circle cx="7" cy="-4" r="1.2" fill="#F5F7D5" />
        </G>
      )}
    </G>
  );
});
export function Tree({
  x,
  y,
  variant = 0,
  theme,
}: {
  x: number;
  y: number;
  variant?: number;
  theme: Theme;
}) {
  return (
    <G x={x} y={y}>
      <Ellipse cx="6" cy="7" rx="43" ry="16" fill="url(#shadow)" />
      <Path d="M-33 1 0-16 34 1 0 18Z" fill={theme.light} />
      <Path
        d="M-33 1 0 18 34 1 29 13 0 27-28 13Z"
        fill={theme.right}
        opacity=".7"
      />
      <Path d="M-3 3 V-39 H4 V4Z" fill="#AB9876" />
      {variant % 2 === 0 ? (
        <G>
          <Ellipse cy="-45" rx="25" ry="32" fill={theme.right} />
          <Ellipse cx="-9" cy="-51" rx="21" ry="29" fill="url(#leaf)" />
          <Ellipse
            cx="-13"
            cy="-59"
            rx="10"
            ry="15"
            fill={theme.light}
            opacity=".5"
          />
        </G>
      ) : (
        <G>
          <Path
            d="M0-84-30-35-19-29-37-10 0 6 37-10 19-29 30-35Z"
            fill={theme.right}
          />
          <Path d="M0-84-30-35 0-20 30-35Z" fill={theme.top} />
          <Path d="M0-49-37-10 0 6Z" fill={theme.light} opacity=".5" />
        </G>
      )}
      <Path
        d="M15 10 Q15-4 24-4 Q25 7 15 10 M-18 7 Q-30-2-28-8 Q-15-6-18 7"
        fill="#7FA383"
      />
    </G>
  );
}
export const Garden = React.memo(function Garden({ tile }: { tile: Tile }) {
  const side = Math.floor(tile.id / 6) % 2 === 0 ? -1 : 1;
  const theme = themes[tile.tier]!;
  const x = tile.x + side * 115;
  const y = tile.y + 12;
  if (tile.id % 6 === 2)
    return <Tree x={x} y={y} variant={Math.floor(tile.id / 6)} theme={theme} />;
  if (tile.id % 6 === 4)
    return (
      <G x={x} y={y}>
        <Ellipse cy="7" rx="29" ry="12" fill="url(#shadow)" />
        {tile.tier === "extraordinary" || tile.tier === "legendary" ? (
          <Reward kind={tile.tier === "legendary" ? "glow" : "collectible"} />
        ) : (
          <G>
            <Path d="M-24 1-16-14 3-20 18-9 23 4 0 12Z" fill="#CFD5C5" />
            <Path d="M-16-14 3-20 18-9 0-4Z" fill="#E4E7DB" />
            <Path d="M0-4 18-9 23 4 0 12Z" fill="#B8C5B3" />
            <Path
              d="M-35 0 Q-41-20-31-22 Q-21-16-28-1 M-28-1 Q-23-29-16-22 Q-10-12-28-1"
              fill={theme.right}
            />
          </G>
        )}
      </G>
    );
  if (tile.id % 6 === 0 && tile.id > 0)
    return (
      <G x={x - side * 20} y={y + 6} opacity=".75">
        <Path
          d="M-18 0 Q-24-16-16-21 Q-7-21-10 0 M-10 0 Q-5-29 2-25 Q12-20-10 0 M-10 0 Q7-16 12-9 Q15-1-10 0"
          fill={theme.right}
        />
        <Circle cx="7" cy="-22" r="3" fill="#E9C78D" />
        <Circle cx="-21" cy="-8" r="2.5" fill="#F4DCA9" />
      </G>
    );
  return null;
});
