import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import Footer from "./components/Footer";
import { createRunForGloryConfig } from "./game/RunForGloryScene";

const GAME_NATIVE_WIDTH = 1280;
const GAME_NATIVE_HEIGHT = 720;
const FOOTER_NATIVE_HEIGHT = (GAME_NATIVE_WIDTH * 290) / 1681;
const STAGE_NATIVE_GAP = 12;
const STAGE_NATIVE_HEIGHT = GAME_NATIVE_HEIGHT + STAGE_NATIVE_GAP + FOOTER_NATIVE_HEIGHT;

function calculateStageScale() {
  if (typeof window === "undefined") {
    return 1;
  }

  return Math.min(window.innerWidth / GAME_NATIVE_WIDTH, window.innerHeight / GAME_NATIVE_HEIGHT);
}

export default function App() {
  const gameHostRef = useRef<HTMLDivElement | null>(null);
  const [stageScale, setStageScale] = useState(calculateStageScale);

  useEffect(() => {
    if (!gameHostRef.current) {
      return undefined;
    }

    const host = gameHostRef.current;
    const game = new Phaser.Game(createRunForGloryConfig(host));

    return () => {
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    const updateStageScale = () => {
      setStageScale(calculateStageScale());
    };

    updateStageScale();
    window.addEventListener("resize", updateStageScale);
    window.visualViewport?.addEventListener("resize", updateStageScale);

    return () => {
      window.removeEventListener("resize", updateStageScale);
      window.visualViewport?.removeEventListener("resize", updateStageScale);
    };
  }, []);

  return (
    <main className="game-page">
      <div
        className="stage-viewport"
        style={{
          width: GAME_NATIVE_WIDTH * stageScale,
          height: STAGE_NATIVE_HEIGHT * stageScale
        }}
      >
        <section
          className="game-stage"
          style={{
            width: GAME_NATIVE_WIDTH,
            height: STAGE_NATIVE_HEIGHT,
            transform: `scale(${stageScale})`
          }}
        >
          <div
            ref={gameHostRef}
            className="game-host"
            aria-label="Run For Glory 2026 game"
          />
          <Footer className="game-footer" />
        </section>
      </div>
    </main>
  );
}
