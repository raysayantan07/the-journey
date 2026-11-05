import { memo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Text as SvgText,
} from "react-native-svg";
import Animated, {
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Character } from "./Character";
import { Garden, Stone, WorldDefs } from "./WorldArt";
import { positionForProgress, type CharacterState, type Tile } from "./model";
import { useAmbientPhase } from "../components/useAmbientPhase";
import { treeAssets } from "./treeAssets";

const AnimatedGroup = Animated.createAnimatedComponent(G);

// Android SVG caches one bitmap per root. Keep animation invalidation local:
// never allocate a route-window-sized bitmap or put the character in terrain's SVG.
const TileSurface = memo(function TileSurface({
  tile,
  completed,
  selected,
  canvasX,
  canvasY,
}: {
  tile: Tile;
  completed: boolean;
  selected: boolean;
  canvasX: number;
  canvasY: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: tile.x - canvasX - 170,
        top: tile.y - canvasY - 110,
        width: 340,
        height: 180,
      }}
    >
      {tile.id % 6 === 2 && (
        <Image
          testID={`journey-tree-${tile.id}`}
          source={treeAssets[tile.tier][Math.floor(tile.id / 6) % 2]!}
          fadeDuration={0}
          resizeMode="contain"
          resizeMethod="scale"
          style={{
            position: "absolute",
            width: 128,
            height: 128,
            left: 170 + (Math.floor(tile.id / 6) % 2 === 0 ? -115 : 115) - 64,
            top: 26,
          }}
        />
      )}
      <Svg
        testID={`journey-tile-${tile.id}`}
        width={340}
        height={180}
        viewBox={`${tile.x - 170} ${tile.y - 110} 340 180`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        <WorldDefs />
        <Circle
          cx={tile.x + 60}
          cy={tile.y + 35}
          r="2"
          fill="#BBC6AC"
          opacity=".5"
        />
        <Circle
          cx={tile.x - 70}
          cy={tile.y - 22}
          r="1.5"
          fill="#BBC6AC"
          opacity=".6"
        />
        <Garden tile={tile} rasterTree />
        <Stone tile={tile} completed={completed} selected={selected} />
      </Svg>
    </View>
  );
});

const SparkSurface = memo(function SparkSurface({
  tile,
  phase,
  canvasX,
  canvasY,
}: {
  tile: Tile;
  phase: SharedValue<number>;
  canvasX: number;
  canvasY: number;
}) {
  const props = useAnimatedProps(() => ({
    opacity: 0.4 + Math.sin(phase.value) * 0.2,
  }));
  return (
    <Svg
      width={34}
      height={34}
      style={{
        position: "absolute",
        left: tile.x - canvasX - 102,
        top: tile.y - canvasY - 78,
      }}
      viewBox="-7 -23 34 34"
    >
      <AnimatedGroup animatedProps={props}>
        <Path d="M0-5 V5 M-5 0 H5" stroke="#D4BA7D" strokeWidth="1.5" />
        <Circle cx="20" cy="-16" r="1.5" fill="#D4BA7D" />
      </AnimatedGroup>
    </Svg>
  );
});

const MistSurface = memo(function MistSurface({
  tile,
  canvasX,
  canvasY,
}: {
  tile: Tile;
  canvasX: number;
  canvasY: number;
}) {
  return (
    <Svg
      width={620}
      height={340}
      style={{
        position: "absolute",
        left: tile.x - canvasX - 230,
        top: tile.y - canvasY - 270,
      }}
    >
      <WorldDefs />
      <Ellipse
        cx="310"
        cy="170"
        rx="310"
        ry="170"
        fill={`url(#mist-${tile.tier})`}
      />
    </Svg>
  );
});

export function NativeWorld({
  tiles,
  step,
  selected,
  tx,
  ty,
  zoom,
  travel,
  facing,
  characterState,
  canvas,
}: {
  tiles: Tile[];
  step: number;
  selected?: number;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  zoom: SharedValue<number>;
  travel: SharedValue<number>;
  facing: SharedValue<number>;
  characterState: CharacterState;
  canvas: { x: number; y: number; width: number; height: number };
}) {
  const phase = useAmbientPhase(7000);
  const cameraStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: zoom.value },
    ],
  }));
  const characterStyle = useAnimatedStyle(() => {
    const p = positionForProgress(travel.value);
    return {
      transform: [
        { translateX: tx.value + (p.x - 110) * zoom.value },
        { translateY: ty.value + (p.y - 160) * zoom.value },
        { scale: zoom.value },
      ],
    };
  });
  return (
    <>
      <Animated.View
        testID="journey-native-camera"
        pointerEvents="none"
        style={[
          styles.world,
          {
            left: canvas.x,
            top: canvas.y,
            width: canvas.width,
            height: canvas.height,
            transformOrigin: [-canvas.x, -canvas.y, 0],
          },
          cameraStyle,
        ]}
      >
        {tiles
          .filter((t) => t.id % 12 === 0)
          .map((t) => (
            <MistSurface
              key={`mist${t.id}`}
              tile={t}
              canvasX={canvas.x}
              canvasY={canvas.y}
            />
          ))}
        {tiles
          .slice()
          .reverse()
          .map((t) => (
            <TileSurface
              key={t.id}
              tile={t}
              completed={t.id <= step}
              selected={selected === t.id}
              canvasX={canvas.x}
              canvasY={canvas.y}
            />
          ))}
        {tiles.some((t) => t.id === 0) && (
          <Svg
            width={330}
            height={80}
            style={{
              position: "absolute",
              left: -55 - canvas.x,
              top: 244 - canvas.y,
            }}
            viewBox="-165 -10 330 80"
          >
            <Path
              d="M-30-8 Q0 4 30-8"
              fill="none"
              stroke="#CBD7BB"
              strokeWidth="1"
            />
            <SvgText
              textAnchor="middle"
              y="22"
              fontFamily="sans-serif"
              fontSize="12"
              letterSpacing="3"
              fill="#8C9D81"
            >
              THE FIRST CHAPTER
            </SvgText>
            <SvgText
              textAnchor="middle"
              y="44"
              fontFamily="sans-serif"
              fontSize="11"
              fill="#A1AD94"
            >
              Every adventure starts somewhere.
            </SvgText>
          </Svg>
        )}
        {tiles
          .filter((t) => t.id % 8 === 0)
          .map((t) => (
            <SparkSurface
              key={`spark${t.id}`}
              tile={t}
              phase={phase}
              canvasX={canvas.x}
              canvasY={canvas.y}
            />
          ))}
      </Animated.View>
      <Animated.View
        testID="journey-native-character"
        pointerEvents="none"
        style={[styles.character, characterStyle]}
      >
        <Svg width={220} height={220} viewBox="-110 -160 220 220">
          <WorldDefs />
          <Character
            travel={travel}
            facing={facing}
            state={characterState}
            local
          />
        </Svg>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  world: {
    position: "absolute",
    overflow: "visible",
  },
  character: {
    position: "absolute",
    width: 220,
    height: 220,
    transformOrigin: [0, 0, 0],
  },
});
