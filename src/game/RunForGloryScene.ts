import Phaser from "phaser";

import runnerSmoothRun1 from "../assets/characters/smooth/runner_smooth_run_1.png";
import runnerSmoothRun2 from "../assets/characters/smooth/runner_smooth_run_2.png";
import runnerSmoothRun3 from "../assets/characters/smooth/runner_smooth_run_3.png";
import runnerSmoothRun4 from "../assets/characters/smooth/runner_smooth_run_4.png";
import runnerSmoothRun5 from "../assets/characters/smooth/runner_smooth_run_5.png";
import runnerSmoothRun6 from "../assets/characters/smooth/runner_smooth_run_6.png";
import runnerSmoothRun7 from "../assets/characters/smooth/runner_smooth_run_7.png";
import runnerSmoothRun8 from "../assets/characters/smooth/runner_smooth_run_8.png";
import runnerSlide from "../assets/characters/runner_slide.png";
import waterBottle from "../assets/collectibles/water_bottle.png";
import energyDrink from "../assets/collectibles/energy_drink.png";
import trafficCone from "../assets/obstacles/traffic_cone.png";
import barricade from "../assets/obstacles/barricade.png";
import background from "../assets/environment/background.png";
import completionShareImage from "../assets/ui/run_for_glory_completion.png";
import topEventBadge from "../assets/ui/top_event_badge.png";

const BASE_GAME_WIDTH = 960;
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const WORLD_SCALE = GAME_WIDTH / BASE_GAME_WIDTH;
const S = (value: number) => value * WORLD_SCALE;
const RUNNER_X = S(164);
const GROUND_Y = GAME_HEIGHT - S(22);
const MAX_LIVES = 3;
const SHOW_ALIGNMENT_DEBUG = false;
const CHALLENGE_DURATION_SECONDS = 60;
const SPEED_BOOST_MULTIPLIER = 1.5;
const SLOW_PACE_MULTIPLIER = 0.65;
const FATIGUE_TOTAL_BARS = 10;
const FATIGUE_BAR_INTERVAL_SECONDS = 2;
const FATIGUE_MAX_SECONDS = FATIGUE_TOTAL_BARS * FATIGUE_BAR_INTERVAL_SECONDS;
const WATER_BOTTLE_FATIGUE_RECHARGE_SECONDS = 4;
const ENERGY_DRINK_FATIGUE_RECHARGE_SECONDS = 6;
const OBSTACLE_FATIGUE_PENALTY_SECONDS = 3;
const FATIGUE_RECHARGE_BLINK_MS = 720;
const FATIGUE_METER_WIDTH = S(220);
const FATIGUE_METER_HEIGHT = S(22);
const FALLEN_RUNNER_GROUND_Y = GROUND_Y - S(2);
const BACKGROUND_TILE_SCALE = S(0.629);
const TIMER_Y = S(16);
const TIMER_WIDTH = S(250);
const TIMER_HEIGHT = S(76);
const HUD_RIGHT_MARGIN = S(18);
const HUD_X = GAME_WIDTH - TIMER_WIDTH - HUD_RIGHT_MARGIN;
const HUD_Y = TIMER_Y + TIMER_HEIGHT + S(12);
const HUD_WIDTH = S(220);
const HUD_HEIGHT = S(100);
const EVENT_BADGE_CROP = { x: 16, y: 75, width: 577, height: 241 };
const EVENT_BADGE_WIDTH = S(225);
const EVENT_BADGE_HEIGHT = EVENT_BADGE_WIDTH * (EVENT_BADGE_CROP.height / EVENT_BADGE_CROP.width);
const CONTROL_BUTTON_SIZE = S(58);
const CONTROL_BUTTON_GAP = S(10);
const CONTROL_CLUSTER_X = GAME_WIDTH - S(96);
const CONTROL_CLUSTER_Y = GAME_HEIGHT - S(78);
const FATIGUE_METER_X = CONTROL_CLUSTER_X - S(36);
const FATIGUE_METER_Y = CONTROL_CLUSTER_Y + CONTROL_BUTTON_SIZE / 2 + S(18);
const RUN_FRAME_BASE_INTERVAL_MS = 68;
const RUN_FRAME_MIN_INTERVAL_MS = 50;
const RUN_FRAME_MAX_INTERVAL_MS = 95;
const DIFFICULTY_RAMP_DISTANCE = 1800;
const FIRST_OBSTACLE_DISTANCE = 56;
const FIRST_COLLECTIBLE_DISTANCE = 20;
const COLLECTIBLE_OBSTACLE_BUFFER = 28;
const LEADERBOARD_STORAGE_KEY = "run-for-glory-2026-leaderboard";
const RUN_ATTEMPTS_STORAGE_KEY = "run-for-glory-2026-attempts";
const MAX_LOCAL_LEADERBOARD_ENTRIES = 20;
const MAX_LOCAL_RUN_ATTEMPTS = 100;
const ADMIN_NAME = "admin";
const ADMIN_COMPANY = "admin020";
const RUN_FRAME_KEYS = [
  "runner_smooth_run_1",
  "runner_smooth_run_2",
  "runner_smooth_run_3",
  "runner_smooth_run_4",
  "runner_smooth_run_5",
  "runner_smooth_run_6",
  "runner_smooth_run_7",
  "runner_smooth_run_8"
] as const;

const assetMap = {
  runner_smooth_run_1: runnerSmoothRun1,
  runner_smooth_run_2: runnerSmoothRun2,
  runner_smooth_run_3: runnerSmoothRun3,
  runner_smooth_run_4: runnerSmoothRun4,
  runner_smooth_run_5: runnerSmoothRun5,
  runner_smooth_run_6: runnerSmoothRun6,
  runner_smooth_run_7: runnerSmoothRun7,
  runner_smooth_run_8: runnerSmoothRun8,
  runner_slide: runnerSlide,
  water_bottle: waterBottle,
  energy_drink: energyDrink,
  traffic_cone: trafficCone,
  barricade,
  background,
  top_event_badge: topEventBadge
};

type ScrollItem = Phaser.Physics.Arcade.Image;

type ObstacleDefinition = {
  key: "traffic_cone" | "barricade";
  scale: number;
  groundOffset: number;
  bodyWidth: number;
  bodyHeight: number;
  bodyYOffset: number;
};

type CollectibleDefinition = {
  key: "water_bottle" | "energy_drink";
  scale: number;
  heightAboveGround: number;
};

type VirtualControlDirection = "up" | "left" | "right";

type LeaderboardEntry = {
  name: string;
  company: string;
  linkedInUrl: string;
  distance: number;
  createdAt: number;
};

type RunAttemptEntry = {
  id: string;
  name: string;
  company: string;
  distance: number;
  createdAt: number;
};

const obstacleDefinitions: ObstacleDefinition[] = [
  {
    key: "traffic_cone",
    scale: S(0.52),
    groundOffset: 0,
    bodyWidth: 0.56,
    bodyHeight: 0.8,
    bodyYOffset: 0.18
  },
  {
    key: "barricade",
    scale: S(0.58),
    groundOffset: 0,
    bodyWidth: 0.82,
    bodyHeight: 0.7,
    bodyYOffset: 0.22
  }
];

const collectibleDefinitions: CollectibleDefinition[] = [
  { key: "water_bottle", scale: S(0.38), heightAboveGround: S(94) },
  { key: "energy_drink", scale: S(0.38), heightAboveGround: S(204) }
];

export function createRunForGloryConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#8ed7f3",
    scale: {
      mode: Phaser.Scale.NONE
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: S(1550), x: 0 },
        debug: false
      }
    },
    dom: {
      createContainer: true
    },
    scene: [RunForGloryScene]
  };
}

class RunForGloryScene extends Phaser.Scene {
  private runner!: Phaser.Physics.Arcade.Sprite;
  private groundBody!: Phaser.GameObjects.Rectangle;
  private backgroundLayer!: Phaser.GameObjects.TileSprite;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private upKey!: Phaser.Input.Keyboard.Key;
  private leftKey!: Phaser.Input.Keyboard.Key;
  private rightKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private timerCover!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;
  private timerRunnerText!: Phaser.GameObjects.Text;
  private fatigueMeter!: Phaser.GameObjects.Graphics;
  private hudCover!: Phaser.GameObjects.Graphics;
  private hudDistance!: Phaser.GameObjects.Text;
  private hudLives!: Phaser.GameObjects.Text;
  private hudStaticLabels: Phaser.GameObjects.Text[] = [];
  private controlsContainer?: Phaser.GameObjects.Container;
  private virtualControlButtons: Phaser.GameObjects.Container[] = [];
  private startOverlay?: Phaser.GameObjects.Container;
  private gameOverOverlay?: Phaser.GameObjects.Container;
  private submitDistanceOverlay?: Phaser.GameObjects.Container;
  private myScoresOverlay?: Phaser.GameObjects.Container;
  private myScoresDom?: Phaser.GameObjects.DOMElement;
  private alreadySubmittedOverlay?: Phaser.GameObjects.Container;
  private nameInput?: Phaser.GameObjects.DOMElement;
  private companyInput?: Phaser.GameObjects.DOMElement;
  private linkedInInput?: Phaser.GameObjects.DOMElement;
  private playerName = "";
  private companyName = "";
  private pendingPlayerName = "";
  private pendingCompanyName = "";
  private pendingAutoStart = false;
  private distanceSubmitted = false;
  private runAttemptRecorded = false;
  private selectedAttemptId = "";
  private finalDistanceForSubmission?: number;
  private runFrameIndex = 0;
  private runFrameTimer = 0;
  private gameSpeed = S(300);
  private distance = 0;
  private challengeElapsed = 0;
  private fatigueSecondsRemaining = FATIGUE_MAX_SECONDS;
  private fatigueBlinkUntil = 0;
  private obstaclesHit = 0;
  private lives = MAX_LIVES;
  private started = false;
  private isGameOver = false;
  private nextObstacleDistance = FIRST_OBSTACLE_DISTANCE;
  private nextCollectibleDistance = FIRST_COLLECTIBLE_DISTANCE;
  private lastObstacleDistance = -Infinity;
  private lastCollectibleDistance = -Infinity;
  private invulnerableUntil = 0;
  private virtualLeftDown = false;
  private virtualRightDown = false;

  constructor() {
    super("RunForGloryScene");
  }

  init(data?: { playerName?: string; companyName?: string; autoStart?: boolean }) {
    this.pendingPlayerName = data?.playerName?.trim() ?? "";
    this.pendingCompanyName = data?.companyName?.trim() ?? "";
    this.pendingAutoStart = Boolean(data?.autoStart && this.pendingPlayerName);
  }

  preload() {
    Object.entries(assetMap).forEach(([key, url]) => {
      this.load.image(key, url);
    });
  }

  create() {
    this.resetRunState();
    this.createWorld();
    this.createRunner();
    this.createFatigueMeter();
    this.createGroups();
    this.createHud();
    this.createTopEventBadge();
    this.createInput();
    this.createOnScreenControls();

    if (this.pendingAutoStart) {
      this.started = true;
      this.setOnScreenControlsVisible(true);
      this.physics.resume();
      this.updateHud();
      return;
    }

    this.createStartOverlay();
    this.physics.pause();
  }

  private resetRunState() {
    this.runFrameIndex = 0;
    this.runFrameTimer = 0;
    this.gameSpeed = S(300);
    this.distance = 0;
    this.challengeElapsed = 0;
    this.fatigueSecondsRemaining = FATIGUE_MAX_SECONDS;
    this.fatigueBlinkUntil = 0;
    this.obstaclesHit = 0;
    this.lives = MAX_LIVES;
    this.started = false;
    this.isGameOver = false;
    this.nextObstacleDistance = FIRST_OBSTACLE_DISTANCE;
    this.nextCollectibleDistance = FIRST_COLLECTIBLE_DISTANCE;
    this.lastObstacleDistance = -Infinity;
    this.lastCollectibleDistance = -Infinity;
    this.invulnerableUntil = 0;
    this.virtualLeftDown = false;
    this.virtualRightDown = false;
    this.startOverlay = undefined;
    this.gameOverOverlay = undefined;
    this.submitDistanceOverlay = undefined;
    this.myScoresOverlay = undefined;
    this.myScoresDom = undefined;
    this.alreadySubmittedOverlay = undefined;
    this.controlsContainer = undefined;
    this.virtualControlButtons = [];
    this.nameInput = undefined;
    this.companyInput = undefined;
    this.linkedInInput = undefined;
    this.hudStaticLabels = [];
    this.playerName = this.pendingPlayerName || "";
    this.companyName = this.pendingCompanyName || "";
    this.distanceSubmitted = false;
    this.runAttemptRecorded = false;
    this.selectedAttemptId = "";
    this.finalDistanceForSubmission = undefined;
  }

  update(_time: number, delta: number) {
    this.handleKeyboard();

    if (!this.started || this.isGameOver) {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.challengeElapsed = Math.min(CHALLENGE_DURATION_SECONDS, this.challengeElapsed + deltaSeconds);
    this.fatigueSecondsRemaining = Math.max(0, this.fatigueSecondsRemaining - deltaSeconds);
    this.gameSpeed = this.currentBaseSpeed() * this.currentSpeedMultiplier();
    this.distance += this.gameSpeed * deltaSeconds * 0.09;

    this.scrollWorld(deltaSeconds);
    this.spawnGameplayItems();
    this.updateMovingGroups();
    this.animateRunner(delta);
    this.cleanupOffscreenItems();
    this.updateFatigueMeter();
    this.updateHud();

    if (this.isFatigueEmpty()) {
      this.endGame("fatigue");
      return;
    }

    if (this.challengeElapsed >= CHALLENGE_DURATION_SECONDS) {
      this.endGame("time");
    }
  }

  private createWorld() {
    this.backgroundLayer = this.add
      .tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "background")
      .setDepth(0)
      .setTileScale(BACKGROUND_TILE_SCALE, BACKGROUND_TILE_SCALE);

    this.groundBody = this.add.rectangle(
      GAME_WIDTH / 2,
      GROUND_Y + S(8),
      GAME_WIDTH,
      S(18),
      0x000000,
      0
    );
    this.physics.add.existing(this.groundBody, true);
    this.createAlignmentDebug();
  }

  private createRunner() {
    this.runner = this.physics.add
      .sprite(RUNNER_X, GROUND_Y, "runner_smooth_run_1")
      .setOrigin(0.5, 1)
      .setDepth(20);
    this.setRunnerRunDisplay();
    this.runner.setCollideWorldBounds(true);

    const body = this.runner.body as Phaser.Physics.Arcade.Body;
    body.setSize(104, 230);
    body.setOffset(68, 82);

    this.physics.add.collider(this.runner, this.groundBody);
  }

  private createFatigueMeter() {
    this.fatigueMeter = this.add.graphics().setDepth(21);
    this.updateFatigueMeter();
  }

  private createGroups() {
    this.obstacles = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.collectibles = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    this.physics.add.overlap(this.runner, this.obstacles, (_, obstacle) => {
      this.handleObstacleHit(obstacle as ScrollItem);
    });
    this.physics.add.overlap(this.runner, this.collectibles, (_, collectible) => {
      this.handleCollectible(collectible as ScrollItem);
    });
  }

  private createHud() {
    this.timerCover = this.add.graphics().setDepth(1000);
    this.timerText = this.add
      .text(HUD_X + TIMER_WIDTH / 2, TIMER_Y + S(30), "", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(25)}px`,
        fontStyle: "bold",
        stroke: "#031a31",
        strokeThickness: S(4)
      })
      .setOrigin(0.5)
      .setDepth(1002);
    this.timerRunnerText = this.add
      .text(HUD_X + TIMER_WIDTH / 2, TIMER_Y + S(59), "", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(13)}px`,
        fontStyle: "bold",
        stroke: "#031a31",
        strokeThickness: S(3)
      })
      .setOrigin(0.5)
      .setDepth(1002);

    this.hudCover = this.add.graphics().setDepth(1000);
    this.hudLives = this.add
      .text(HUD_X + HUD_WIDTH / 2, HUD_Y + S(24), "", this.hudTextStyle(16))
      .setOrigin(0.5)
      .setDepth(1002);
    const distanceLabel = this.add
      .text(HUD_X + S(18), HUD_Y + S(58), "DISTANCE", this.hudLabelStyle())
      .setOrigin(0, 0.5)
      .setDepth(1002);
    this.hudDistance = this.add
      .text(HUD_X + HUD_WIDTH - S(18), HUD_Y + S(74), "", this.hudTextStyle(25))
      .setOrigin(1, 0.5)
      .setDepth(1002);
    this.hudStaticLabels = [distanceLabel];

    this.updateHud();
  }

  private createTopEventBadge() {
    this.add
      .image(S(18), S(16), "top_event_badge")
      .setOrigin(0)
      .setCrop(
        EVENT_BADGE_CROP.x,
        EVENT_BADGE_CROP.y,
        EVENT_BADGE_CROP.width,
        EVENT_BADGE_CROP.height
      )
      .setDisplaySize(EVENT_BADGE_WIDTH, EVENT_BADGE_HEIGHT)
      .setDepth(900);
  }

  private createInput() {
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.leftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.input.keyboard!.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.ENTER
    ]);

    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (this.pointerIsOverVirtualControl(currentlyOver)) {
        return;
      }

      if (this.isGameOver) {
        return;
      }

      if (!this.started) {
        return;
      }

      this.jump();
    });
    this.input.on("pointerup", () => this.releaseVirtualPaceControls());
  }

  private createOnScreenControls() {
    const rowOffset = CONTROL_BUTTON_SIZE + CONTROL_BUTTON_GAP;
    const upButton = this.createVirtualControlButton(
      "up",
      CONTROL_CLUSTER_X,
      CONTROL_CLUSTER_Y - rowOffset
    );
    const leftButton = this.createVirtualControlButton(
      "left",
      CONTROL_CLUSTER_X - rowOffset / 2,
      CONTROL_CLUSTER_Y
    );
    const rightButton = this.createVirtualControlButton(
      "right",
      CONTROL_CLUSTER_X + rowOffset / 2,
      CONTROL_CLUSTER_Y
    );

    this.virtualControlButtons = [upButton, leftButton, rightButton];
    this.controlsContainer = this.add
      .container(0, 0, this.virtualControlButtons)
      .setDepth(1100)
      .setVisible(false);
  }

  private createVirtualControlButton(direction: VirtualControlDirection, x: number, y: number) {
    const size = CONTROL_BUTTON_SIZE;
    const radius = S(18);
    const shadow = this.add.graphics();
    const body = this.add.graphics();
    const arrow = this.add.graphics();
    const button = this.add.container(x, y, [shadow, body, arrow]);

    shadow.fillStyle(0x03111f, 0.32);
    shadow.fillRoundedRect(-size / 2 + S(3), -size / 2 + S(6), size, size, radius);

    body.fillStyle(0x16c85a, 0.98);
    body.fillRoundedRect(-size / 2, -size / 2, size, size, radius);
    body.fillStyle(0x4ade80, 0.84);
    body.fillRoundedRect(-size * 0.42, -size * 0.42, size * 0.84, size * 0.46, radius);
    body.fillStyle(0xb8ffb8, 0.34);
    body.fillEllipse(size * 0.14, size * 0.1, size * 0.62, size * 0.5);
    body.fillStyle(0xffffff, 0.72);
    body.fillEllipse(-size * 0.22, -size * 0.26, size * 0.25, size * 0.1);
    body.lineStyle(S(3), 0x0f9f45, 0.96);
    body.strokeRoundedRect(-size / 2, -size / 2, size, size, radius);
    body.lineStyle(S(2), 0x86efac, 0.78);
    body.strokeRoundedRect(-size / 2 + S(4), -size / 2 + S(4), size - S(8), size - S(8), radius);

    this.drawVirtualControlArrow(arrow, direction, size);

    button.setSize(size, size);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
      Phaser.Geom.Rectangle.Contains
    );
    if (button.input) {
      button.input.cursor = "pointer";
    }

    button.on("pointerdown", (...args: unknown[]) => {
      this.stopVirtualControlPropagation(args);
      this.handleVirtualControlDown(direction, button);
    });
    button.on("pointerup", (...args: unknown[]) => {
      this.stopVirtualControlPropagation(args);
      this.handleVirtualControlUp(direction, button);
    });
    button.on("pointerout", (...args: unknown[]) => {
      this.stopVirtualControlPropagation(args);
      this.handleVirtualControlUp(direction, button);
    });
    button.on("pointerupoutside", (...args: unknown[]) => {
      this.stopVirtualControlPropagation(args);
      this.handleVirtualControlUp(direction, button);
    });

    return button;
  }

  private drawVirtualControlArrow(
    arrow: Phaser.GameObjects.Graphics,
    direction: VirtualControlDirection,
    size: number
  ) {
    const drawChevron = (color: number, alpha: number, thickness: number) => {
      arrow.lineStyle(thickness, color, alpha);
      arrow.beginPath();

      if (direction === "right") {
        arrow.moveTo(-size * 0.15, -size * 0.22);
        arrow.lineTo(size * 0.15, 0);
        arrow.lineTo(-size * 0.15, size * 0.22);
      } else if (direction === "left") {
        arrow.moveTo(size * 0.15, -size * 0.22);
        arrow.lineTo(-size * 0.15, 0);
        arrow.lineTo(size * 0.15, size * 0.22);
      } else {
        arrow.moveTo(-size * 0.22, size * 0.14);
        arrow.lineTo(0, -size * 0.16);
        arrow.lineTo(size * 0.22, size * 0.14);
      }

      arrow.strokePath();
    };

    drawChevron(0x07572e, 0.34, S(11));
    drawChevron(0x087f40, 0.96, S(7));
  }

  private handleVirtualControlDown(
    direction: VirtualControlDirection,
    button: Phaser.GameObjects.Container
  ) {
    if (!this.started || this.isGameOver) {
      return;
    }

    button.setScale(0.94);

    if (direction === "up") {
      this.jump();
      return;
    }

    if (direction === "left") {
      this.virtualLeftDown = true;
      return;
    }

    this.virtualRightDown = true;
  }

  private handleVirtualControlUp(
    direction: VirtualControlDirection,
    button: Phaser.GameObjects.Container
  ) {
    button.setScale(1);

    if (direction === "left") {
      this.virtualLeftDown = false;
    } else if (direction === "right") {
      this.virtualRightDown = false;
    }
  }

  private stopVirtualControlPropagation(args: unknown[]) {
    const maybeEvent = args[args.length - 1] as { stopPropagation?: () => void } | undefined;
    maybeEvent?.stopPropagation?.();
  }

  private pointerIsOverVirtualControl(currentlyOver: Phaser.GameObjects.GameObject[] = []) {
    return currentlyOver.some((item) =>
      this.virtualControlButtons.includes(item as Phaser.GameObjects.Container)
    );
  }

  private releaseVirtualPaceControls() {
    this.virtualLeftDown = false;
    this.virtualRightDown = false;
    this.virtualControlButtons.forEach((button) => button.setScale(1));
  }

  private setOnScreenControlsVisible(visible: boolean) {
    this.controlsContainer?.setVisible(visible);

    if (!visible) {
      this.releaseVirtualPaceControls();
    }
  }

  private createStartOverlay() {
    const panelWidth = S(720);
    const panelHeight = S(510);
    const panelY = GAME_HEIGHT / 2;
    const instructions = [
      "🏃 The runner moves automatically.",
      "⬆️ Up Arrow - Jump over obstacles.",
      "➡️ Right Arrow - Sprint and increase your running speed.",
      "⬅️ Left Arrow - Slow down to better time your jumps and avoid obstacles.",
      "🚧 Avoid Traffic Cones & Barricades. Hitting obstacles costs both Energy and Lives.",
      "🏁 Run as far as possible within 60 seconds. Your distance is your final result.",
      "⚡ Energy gradually decreases while running and drops faster when you collide with obstacles.",
      "💧 Collect Water Bottles and ⚡ Energy Drinks to restore your Energy.",
      "❤️ You have 3 Lives. The game ends if you hit obstacles 3 times or if your Energy is exhausted.",
      "🏆 Cover the maximum distance to secure your place on the leaderboard!",
      "🏆 You may play multiple times to achieve your best distance. Once you submit your final score, your entry is locked and no further attempts will be allowed."
    ].join("\n");

    const shade = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03111f, 0.28)
      .setOrigin(0);
    const panel = this.add
      .rectangle(GAME_WIDTH / 2, panelY, panelWidth, panelHeight, 0xffffff, 0.95)
      .setStrokeStyle(S(3), 0x0ea5e9);
    const title = this.add
      .text(GAME_WIDTH / 2, panelY - panelHeight / 2 + S(42), "How to Play", {
        color: "#05345e",
        fontFamily: "Arial, 'Segoe UI Emoji', sans-serif",
        fontSize: `${S(26)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const instructionText = this.add
      .text(GAME_WIDTH / 2, panelY - panelHeight / 2 + S(82), instructions, {
        color: "#0f344f",
        fontFamily: "Arial, 'Segoe UI Emoji', sans-serif",
        fontSize: `${S(12)}px`,
        fontStyle: "bold",
        lineSpacing: S(5),
        wordWrap: { width: panelWidth - S(74), useAdvancedWrap: true }
      })
      .setOrigin(0.5, 0);
    const fieldY = panelY + S(106);
    const labelY = fieldY - S(35);
    const fieldGap = S(170);
    const nameLabel = this.add
      .text(GAME_WIDTH / 2 - fieldGap, labelY, "Name", this.startFieldLabelStyle())
      .setOrigin(0.5);
    const companyLabel = this.add
      .text(GAME_WIDTH / 2 + fieldGap, labelY, "Company", this.startFieldLabelStyle())
      .setOrigin(0.5);
    this.nameInput = this.createStartInput(
      GAME_WIDTH / 2 - fieldGap,
      fieldY,
      "Your name",
      "runner-name-input"
    );
    this.companyInput = this.createStartInput(
      GAME_WIDTH / 2 + fieldGap,
      fieldY,
      "Company",
      "runner-company-input"
    );
    const button = this.add
      .rectangle(GAME_WIDTH / 2, panelY + panelHeight / 2 - S(45), S(176), S(48), 0x0284c7)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add
      .text(GAME_WIDTH / 2, panelY + panelHeight / 2 - S(45), "Start Run", {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(20)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.startRun());

    this.startOverlay = this.add
      .container(0, 0, [shade, panel, title, instructionText, nameLabel, companyLabel, button, buttonText])
      .setDepth(2000);
  }

  private createStartInput(x: number, y: number, placeholder: string, testId: string) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.maxLength = 32;
    input.className = "runner-start-input";
    input.dataset.testid = testId;
    input.style.width = `${S(250)}px`;
    input.style.height = `${S(36)}px`;
    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Enter") {
        this.startRun();
      }
    });
    input.addEventListener("pointerdown", (event) => event.stopPropagation());

    return this.add.dom(x, y, input).setDepth(2002);
  }

  private startRun() {
    if (this.started || this.alreadySubmittedOverlay) {
      return;
    }

    const enteredName = this.readStartInput(this.nameInput) || "Runner";
    const enteredCompany = this.readStartInput(this.companyInput);

    if (this.isAdminLogin(enteredName, enteredCompany)) {
      this.openAdminLeaderboard();
      return;
    }

    if (this.hasFinalSubmission(enteredName, enteredCompany)) {
      this.createAlreadySubmittedOverlay();
      return;
    }

    this.playerName = enteredName;
    this.companyName = enteredCompany;
    this.nameInput?.destroy();
    this.companyInput?.destroy();
    this.nameInput = undefined;
    this.companyInput = undefined;
    this.started = true;
    this.startOverlay?.destroy();
    this.setOnScreenControlsVisible(true);
    this.physics.resume();
    this.updateHud();
  }

  private isAdminLogin(name: string, company: string) {
    return (
      name.trim().toLocaleLowerCase() === ADMIN_NAME &&
      company.trim().toLocaleLowerCase() === ADMIN_COMPANY
    );
  }

  private openAdminLeaderboard() {
    this.nameInput?.destroy();
    this.companyInput?.destroy();
    this.nameInput = undefined;
    this.companyInput = undefined;
    this.startOverlay?.destroy();
    this.startOverlay = undefined;
    this.setOnScreenControlsVisible(false);
    this.physics.pause();
    this.createLeaderboardOverlay(() => {
      this.createStartOverlay();
      this.physics.pause();
    });
  }

  private readStartInput(input?: Phaser.GameObjects.DOMElement) {
    const value = (input?.node as HTMLInputElement | undefined)?.value ?? "";

    return value.trim().replace(/\s+/g, " ").slice(0, 32);
  }

  private createAlreadySubmittedOverlay() {
    this.setStartOverlayVisible(false);

    const panelWidth = S(560);
    const panelHeight = S(310);
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;
    const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03111f, 0.36).setOrigin(0);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff, 0.98)
      .setStrokeStyle(S(3), 0x0284c7);
    const title = this.add
      .text(panelX, panelY - panelHeight / 2 + S(50), "✅ Final Score Already Submitted", {
        color: "#05345e",
        fontFamily: "Arial, 'Segoe UI Emoji', sans-serif",
        fontSize: `${S(22)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const message = this.add
      .text(
        panelX,
        panelY - panelHeight / 2 + S(98),
        [
          "You have already submitted your final score for this competition.",
          "",
          "As per the rules, no further game attempts are allowed.",
          "",
          "Thank you for participating!"
        ].join("\n"),
        {
          color: "#0f344f",
          fontFamily: "Arial, sans-serif",
          fontSize: `${S(16)}px`,
          fontStyle: "bold",
          align: "center",
          lineSpacing: S(7),
          wordWrap: { width: panelWidth - S(70), useAdvancedWrap: true }
        }
      )
      .setOrigin(0.5, 0);
    const backButton = this.createGameOverButton(
      panelX,
      panelY + panelHeight / 2 - S(42),
      S(150),
      S(42),
      "Back",
      0xea580c,
      () => this.closeAlreadySubmittedOverlay()
    );

    this.alreadySubmittedOverlay = this.add
      .container(0, 0, [
        shade,
        panel,
        title,
        message,
        backButton.rect,
        backButton.text
      ])
      .setDepth(2400);
  }

  private closeAlreadySubmittedOverlay() {
    this.alreadySubmittedOverlay?.destroy();
    this.alreadySubmittedOverlay = undefined;
    this.setStartOverlayVisible(true);
  }

  private setStartOverlayVisible(visible: boolean) {
    this.startOverlay?.setVisible(visible);
    [this.nameInput, this.companyInput].forEach((input) => {
      const element = input?.node as HTMLInputElement | undefined;

      input?.setVisible(visible);
      if (element) {
        element.disabled = !visible;
        element.style.visibility = visible ? "visible" : "hidden";
      }
    });
  }

  private handleKeyboard() {
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.upKey);
    const enterPressed = Phaser.Input.Keyboard.JustDown(this.enterKey);

    if (this.isGameOver) {
      return;
    }

    if (!this.started && (jumpPressed || enterPressed)) {
      this.startRun();
      return;
    }

    if (jumpPressed) {
      this.jump();
    }
  }

  private jump() {
    if (!this.started || this.isGameOver) {
      return;
    }

    const body = this.runner.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down || body.touching.down) {
      this.runner.setVelocityY(-S(690));
      this.runFrameTimer = 0;
    }
  }

  private scrollWorld(deltaSeconds: number) {
    this.backgroundLayer.tilePositionX += this.gameSpeed * deltaSeconds * 0.28;
  }

  private currentBaseSpeed() {
    return Phaser.Math.Clamp(S(300) + this.distance * S(0.22), S(300), S(640));
  }

  private currentSpeedMultiplier() {
    if (!this.started || this.isGameOver) {
      return 1;
    }

    if (this.rightKey?.isDown || this.virtualRightDown) {
      return SPEED_BOOST_MULTIPLIER;
    }

    if (this.leftKey?.isDown || this.virtualLeftDown) {
      return SLOW_PACE_MULTIPLIER;
    }

    return 1;
  }

  private difficultyProgress() {
    return Phaser.Math.Clamp(this.distance / DIFFICULTY_RAMP_DISTANCE, 0, 1);
  }

  private nextObstacleGap() {
    const progress = this.difficultyProgress();
    const minGap = Phaser.Math.Linear(112, 58, progress);
    const maxGap = Phaser.Math.Linear(150, 86, progress);

    return Phaser.Math.Between(Math.round(minGap), Math.round(maxGap));
  }

  private nextCollectibleGap(key: CollectibleDefinition["key"]) {
    const progress = this.difficultyProgress();
    const minGap = Phaser.Math.Linear(34, 48, progress);
    const maxGap = Phaser.Math.Linear(66, 96, progress);
    const recoveryDelay = key === "water_bottle" ? Phaser.Math.Between(8, 18) : 0;

    return Phaser.Math.Between(Math.round(minGap), Math.round(maxGap)) + recoveryDelay;
  }

  private collectibleObstacleBuffer(key: CollectibleDefinition["key"]) {
    const progress = this.difficultyProgress();
    const baseBuffer = Phaser.Math.Linear(COLLECTIBLE_OBSTACLE_BUFFER, 20, progress);

    return key === "water_bottle" ? baseBuffer + 8 : baseBuffer;
  }

  private chooseCollectibleDefinition() {
    const progress = this.difficultyProgress();
    const waterBottleDefinition = collectibleDefinitions.find(
      (definition) => definition.key === "water_bottle"
    )!;
    const energyDrinkDefinition = collectibleDefinitions.find(
      (definition) => definition.key === "energy_drink"
    )!;
    const waterChance = this.fatigueSecondsRemaining < FATIGUE_MAX_SECONDS * 0.45
      ? Phaser.Math.Linear(0.68, 0.48, progress)
      : Phaser.Math.Linear(0.48, 0.24, progress);

    return Phaser.Math.FloatBetween(0, 1) < waterChance
      ? waterBottleDefinition
      : energyDrinkDefinition;
  }

  private shouldDelayCollectible(buffer: number) {
    return (
      this.distance - this.lastObstacleDistance < buffer ||
      this.nextObstacleDistance - this.distance < buffer
    );
  }

  private delayCollectibleUntilSafe(buffer: number) {
    if (this.distance - this.lastObstacleDistance < buffer) {
      this.nextCollectibleDistance = this.lastObstacleDistance + buffer;
      return;
    }

    this.nextCollectibleDistance = this.nextObstacleDistance + buffer;
  }

  private spawnGameplayItems() {
    if (this.distance >= this.nextObstacleDistance) {
      this.spawnObstacle();
      this.lastObstacleDistance = this.distance;
      this.nextObstacleDistance = this.distance + this.nextObstacleGap();
    }

    if (this.distance >= this.nextCollectibleDistance) {
      const definition = this.chooseCollectibleDefinition();
      const buffer = this.collectibleObstacleBuffer(definition.key);

      if (this.shouldDelayCollectible(buffer)) {
        this.delayCollectibleUntilSafe(buffer);
        return;
      }

      this.spawnCollectible(definition);
      this.lastCollectibleDistance = this.distance;
      this.nextCollectibleDistance = this.distance + this.nextCollectibleGap(definition.key);
    }
  }

  private spawnObstacle() {
    const definition = Phaser.Utils.Array.GetRandom(obstacleDefinitions);
    const obstacle = this.obstacles.create(
      GAME_WIDTH + S(80),
      GROUND_Y + definition.groundOffset,
      definition.key
    ) as ScrollItem;

    obstacle
      .setOrigin(0.5, 1)
      .setScale(definition.scale)
      .setDepth(18)
      .setVelocityX(-this.gameSpeed);

    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(obstacle.width * definition.bodyWidth, obstacle.height * definition.bodyHeight);
    body.setOffset(
      obstacle.width * (1 - definition.bodyWidth) * 0.5,
      obstacle.height * definition.bodyYOffset
    );
  }

  private spawnCollectible(definition: CollectibleDefinition) {
    const collectible = this.collectibles.create(
      GAME_WIDTH + S(90),
      GROUND_Y - definition.heightAboveGround,
      definition.key
    ) as ScrollItem;

    collectible
      .setOrigin(0.5)
      .setScale(definition.scale)
      .setDepth(16)
      .setVelocityX(-this.gameSpeed * 0.98);

    const body = collectible.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setCircle(Math.min(collectible.width, collectible.height) * 0.4);
  }

  private updateMovingGroups() {
    this.obstacles.children.each((child) => {
      const item = child as ScrollItem;
      item.setVelocityX(-this.gameSpeed);
      return true;
    });

    this.collectibles.children.each((child) => {
      const item = child as ScrollItem;
      item.setVelocityX(-this.gameSpeed * 0.98);
      return true;
    });
  }

  private animateRunner(delta: number) {
    const body = this.runner.body as Phaser.Physics.Arcade.Body;
    const isGrounded = body.blocked.down || body.touching.down;

    if (!isGrounded) {
      this.runner.setTexture("runner_smooth_run_3");
      this.setRunnerRunDisplay();
      return;
    }

    this.runFrameTimer += delta;
    if (this.runFrameTimer < this.currentRunFrameInterval()) {
      return;
    }

    this.runFrameTimer = 0;
    this.runFrameIndex = (this.runFrameIndex + 1) % RUN_FRAME_KEYS.length;
    this.runner.setTexture(RUN_FRAME_KEYS[this.runFrameIndex]);
    this.setRunnerRunDisplay();
  }

  private currentRunFrameInterval() {
    const speedMultiplier = this.currentSpeedMultiplier();

    return Phaser.Math.Clamp(
      RUN_FRAME_BASE_INTERVAL_MS / Math.sqrt(speedMultiplier),
      RUN_FRAME_MIN_INTERVAL_MS,
      RUN_FRAME_MAX_INTERVAL_MS
    );
  }

  private cleanupOffscreenItems() {
    this.obstacles.children.each((child) => {
      const item = child as ScrollItem;
      if (item.x < -S(180)) {
        item.destroy();
      }
      return true;
    });

    this.collectibles.children.each((child) => {
      const item = child as ScrollItem;
      if (item.x < -S(120)) {
        item.destroy();
      }
      return true;
    });
  }

  private handleObstacleHit(obstacle: ScrollItem) {
    if (this.time.now < this.invulnerableUntil || this.isGameOver) {
      return;
    }

    obstacle.destroy();
    this.obstaclesHit += 1;
    this.lives -= 1;
    this.fatigueSecondsRemaining = Math.max(
      0,
      this.fatigueSecondsRemaining - OBSTACLE_FATIGUE_PENALTY_SECONDS
    );
    this.invulnerableUntil = this.time.now + 1200;
    this.setRunnerFallenDisplay(S(142), S(82));
    this.runner.setTint(0xffd1d1);
    this.cameras.main.shake(160, 0.006);

    if (this.lives <= 0) {
      this.updateHud();
      this.endGame("lives");
      return;
    }

    this.time.delayedCall(260, () => {
      if (this.isGameOver) {
        return;
      }

      this.runner.clearTint();
      this.setRunnerRunDisplay();
    });
    this.updateFatigueMeter();
    this.updateHud();
  }

  private handleCollectible(collectible: ScrollItem) {
    if (collectible.texture.key === "water_bottle") {
      this.rechargeFatigue(WATER_BOTTLE_FATIGUE_RECHARGE_SECONDS);
    } else if (collectible.texture.key === "energy_drink") {
      this.rechargeFatigue(ENERGY_DRINK_FATIGUE_RECHARGE_SECONDS);
    }

    this.tweens.add({
      targets: collectible,
      y: collectible.y - S(24),
      alpha: 0,
      scale: collectible.scale * 1.25,
      duration: 140,
      onComplete: () => collectible.destroy()
    });
    this.updateHud();
  }

  private rechargeFatigue(seconds: number) {
    const previousFatigue = this.fatigueSecondsRemaining;
    this.fatigueSecondsRemaining = Phaser.Math.Clamp(
      this.fatigueSecondsRemaining + seconds,
      0,
      FATIGUE_MAX_SECONDS
    );

    if (this.fatigueSecondsRemaining > previousFatigue) {
      this.fatigueBlinkUntil = this.time.now + FATIGUE_RECHARGE_BLINK_MS;
    }
  }

  private endGame(reason: "time" | "lives" | "fatigue") {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.physics.pause();
    this.recordRunAttempt();
    this.setHudVisible(false);
    this.setRunnerFallenDisplay(S(150), S(86));
    if (reason === "lives" || reason === "fatigue") {
      this.runner.setTint(0xfca5a5);
    } else {
      this.runner.clearTint();
    }
    this.createGameOverOverlay();
  }

  private createGameOverOverlay() {
    const rank = this.projectedRank();
    const panelWidth = S(500);
    const panelHeight = S(360);
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;
    const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03111f, 0.76).setOrigin(0);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff, 0.97)
      .setStrokeStyle(S(3), 0x0284c7);
    const title = this.add
      .text(panelX, panelY - panelHeight / 2 + S(44), "GAME OVER", {
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(32)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const playerText = this.add
      .text(panelX, panelY - panelHeight / 2 + S(82), this.resultPlayerLine(), {
        color: "#075985",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(14)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const resultsText = this.add
      .text(
        panelX,
        panelY - S(40),
        [
          `Distance : ${Math.floor(this.distance).toLocaleString()}M`,
          `Rank : #${rank}`
        ].join("\n"),
        {
          color: "#0f344f",
          fontFamily: "Arial, sans-serif",
          fontSize: `${S(22)}px`,
          fontStyle: "bold",
          lineSpacing: S(12),
          stroke: "#e0f2fe",
          strokeThickness: S(2)
        }
      )
      .setOrigin(0.5);
    const buttonYTop = panelY + S(80);
    const buttonYBottom = panelY + S(138);
    const buttonXLeft = panelX - S(122);
    const buttonXRight = panelX + S(122);
    const runAgainButton = this.createGameOverButton(
      buttonXLeft,
      buttonYTop,
      S(190),
      S(42),
      "Run Again",
      0x0284c7,
      () => this.runAgainSamePlayer()
    );
    const leaderboardButton = this.createGameOverButton(
      buttonXRight,
      buttonYTop,
      S(220),
      S(42),
      "View my scores",
      0x1d4ed8,
      () => this.createMyScoresOverlay()
    );
    const changePlayerButton = this.createGameOverButton(
      panelX,
      buttonYBottom,
      S(190),
      S(42),
      "Change player",
      0xea580c,
      () => this.changePlayer()
    );

    this.gameOverOverlay = this.add
      .container(0, 0, [
        shade,
        panel,
        title,
        playerText,
        resultsText,
        runAgainButton.rect,
        runAgainButton.text,
        leaderboardButton.rect,
        leaderboardButton.text,
        changePlayerButton.rect,
        changePlayerButton.text
      ])
      .setDepth(2200);
  }

  private createGameOverButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    onClick: () => void
  ) {
    const rect = this.add
      .rectangle(x, y, width, height, color, 1)
      .setStrokeStyle(S(2), 0xffffff, 0.9)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(15)}px`,
        fontStyle: "bold",
        stroke: "#031a31",
        strokeThickness: S(2)
      })
      .setOrigin(0.5);

    rect.on("pointerdown", onClick);

    return { rect, text };
  }

  private openSubmitDistanceOverlay(finalDistance = Math.floor(this.distance)) {
    this.finalDistanceForSubmission = finalDistance;
    this.gameOverOverlay?.destroy();
    this.gameOverOverlay = undefined;
    this.myScoresDom?.destroy();
    this.myScoresDom = undefined;
    this.myScoresOverlay?.destroy();
    this.myScoresOverlay = undefined;
    this.createSubmitDistanceOverlay();
  }

  private createSubmitDistanceOverlay() {
    const panelWidth = S(520);
    const panelHeight = S(320);
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;
    const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03111f, 0.76).setOrigin(0);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff, 0.97)
      .setStrokeStyle(S(3), 0x0284c7);
    const title = this.add
      .text(panelX, panelY - panelHeight / 2 + S(46), "Submit Final Score", {
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(28)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const summary = this.add
      .text(
        panelX,
        panelY - S(76),
        `${this.resultPlayerLine()}  ·  ${this.activeFinalDistance().toLocaleString()}M`,
        {
          color: "#075985",
          fontFamily: "Arial, sans-serif",
          fontSize: `${S(14)}px`,
          fontStyle: "bold"
        }
      )
      .setOrigin(0.5);
    const label = this.add
      .text(panelX, panelY - S(22), "Linked in URL", this.startFieldLabelStyle())
      .setOrigin(0.5);
    this.linkedInInput = this.createLinkedInInput(panelX, panelY + S(22));
    const backButton = this.createGameOverButton(
      panelX - S(110),
      panelY + panelHeight / 2 - S(44),
      S(160),
      S(42),
      "Back",
      0xea580c,
      () => this.closeSubmitDistanceOverlay()
    );
    const submitButton = this.createGameOverButton(
      panelX + S(105),
      panelY + panelHeight / 2 - S(44),
      S(220),
      S(42),
      "Submit Final Score",
      0x0f766e,
      () => {
        this.handleFinalDistanceSubmit();
      }
    );

    this.submitDistanceOverlay = this.add
      .container(0, 0, [
        shade,
        panel,
        title,
        summary,
        label,
        backButton.rect,
        backButton.text,
        submitButton.rect,
        submitButton.text
      ])
      .setDepth(2300);
  }

  private createLinkedInInput(x: number, y: number) {
    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "https://www.linkedin.com/in/your-profile";
    input.maxLength = 180;
    input.className = "runner-start-input runner-linkedin-input";
    input.dataset.testid = "runner-linkedin-url-input";
    input.style.width = `${S(410)}px`;
    input.style.height = `${S(40)}px`;
    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Enter") {
        this.handleFinalDistanceSubmit();
      }
    });
    input.addEventListener("pointerdown", (event) => event.stopPropagation());

    return this.add.dom(x, y, input).setDepth(2302);
  }

  private readLinkedInInput() {
    const value = (this.linkedInInput?.node as HTMLInputElement | undefined)?.value ?? "";

    return value.trim().replace(/\s+/g, " ").slice(0, 180);
  }

  private handleFinalDistanceSubmit() {
    this.submitFinalDistance(this.readLinkedInInput(), this.activeFinalDistance());
    this.createDistanceSubmittedOverlay();
  }

  private createDistanceSubmittedOverlay() {
    this.linkedInInput?.destroy();
    this.linkedInInput = undefined;
    this.submitDistanceOverlay?.destroy();
    this.submitDistanceOverlay = undefined;

    const panelWidth = S(690);
    const panelHeight = S(480);
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;
    const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03111f, 0.78).setOrigin(0);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff, 0.98)
      .setStrokeStyle(S(3), 0x0284c7);
    const title = this.add
      .text(panelX, panelY - panelHeight / 2 + S(46), "🏁 Score Submitted Successfully!", {
        color: "#05345e",
        fontFamily: "Arial, 'Segoe UI Emoji', sans-serif",
        fontSize: `${S(26)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const message = [
      "Congratulations! Your final score has been successfully submitted to the official leaderboard.",
      "",
      "Thank you for participating in the Zafin RISE 2026 Marathon Challenge.",
      "",
      "Your score has now been locked, and no further game attempts are permitted.",
      "",
      "🏆 If your final score ranks among the Top 5 after the competition closes, we'll reach out to you via your LinkedIn profile to notify you and provide prize claim details.",
      "",
      "Thank you for taking part, and we wish you the very best of luck! 🎉"
    ].join("\n");
    const messageText = this.add
      .text(panelX, panelY - panelHeight / 2 + S(92), message, {
        color: "#0f344f",
        fontFamily: "Arial, 'Segoe UI Emoji', sans-serif",
        fontSize: `${S(14)}px`,
        fontStyle: "bold",
        lineSpacing: S(5),
        wordWrap: { width: panelWidth - S(76), useAdvancedWrap: true }
      })
      .setOrigin(0.5, 0);
    const shareButton = this.createGameOverButton(
      panelX,
      panelY + panelHeight / 2 - S(42),
      S(220),
      S(42),
      "Share on LinkedIn",
      0x0a66c2,
      () => this.openCompletionShareImage()
    );

    this.submitDistanceOverlay = this.add
      .container(0, 0, [shade, panel, title, messageText, shareButton.rect, shareButton.text])
      .setDepth(2400);
  }

  private openCompletionShareImage() {
    window.open(completionShareImage, "_blank", "noopener,noreferrer");
  }

  private closeSubmitDistanceOverlay() {
    this.linkedInInput?.destroy();
    this.linkedInInput = undefined;
    this.submitDistanceOverlay?.destroy();
    this.submitDistanceOverlay = undefined;
    this.finalDistanceForSubmission = undefined;
    this.createGameOverOverlay();
  }

  private activeFinalDistance() {
    return this.finalDistanceForSubmission ?? Math.floor(this.distance);
  }

  private resultPlayerLine() {
    const name = this.playerName || "Runner";

    return this.companyName ? `${name} · ${this.companyName}` : name;
  }

  private runAgainSamePlayer() {
    this.scene.restart({
      playerName: this.playerName || "Runner",
      companyName: this.companyName,
      autoStart: true
    });
  }

  private changePlayer() {
    this.pendingPlayerName = "";
    this.pendingCompanyName = "";
    this.pendingAutoStart = false;
    this.scene.restart({
      playerName: "",
      companyName: "",
      autoStart: false
    });
  }

  private createMyScoresOverlay() {
    const attempts = this.loadRunAttemptsForCurrentPlayer();
    const panelWidth = S(690);
    const panelHeight = S(470);
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;
    const listWidth = S(600);
    const listHeight = S(245);

    this.gameOverOverlay?.destroy();
    this.gameOverOverlay = undefined;
    this.myScoresDom?.destroy();
    this.myScoresDom = undefined;
    this.selectedAttemptId = attempts[0]?.id ?? "";

    const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03111f, 0.76).setOrigin(0);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff, 0.98)
      .setStrokeStyle(S(3), 0x0284c7);
    const title = this.add
      .text(panelX, panelY - panelHeight / 2 + S(42), "MY SCORES", {
        color: "#05345e",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(28)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const playerText = this.add
      .text(panelX, panelY - panelHeight / 2 + S(78), this.resultPlayerLine(), {
        color: "#075985",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(14)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const helperText = this.add
      .text(panelX, panelY - panelHeight / 2 + S(108), "Select one run to submit as your final entry.", {
        color: "#0f344f",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(13)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.myScoresDom = this.add
      .dom(panelX, panelY + S(14), this.createMyScoresListElement(attempts, listWidth, listHeight))
      .setDepth(2302);

    const backButton = this.createGameOverButton(
      panelX - S(125),
      panelY + panelHeight / 2 - S(42),
      S(170),
      S(42),
      "Back",
      0xea580c,
      () => this.closeMyScoresOverlay()
    );
    const submitButton = this.createGameOverButton(
      panelX + S(125),
      panelY + panelHeight / 2 - S(42),
      S(240),
      S(42),
      "Submit as Final Score",
      0x0f766e,
      () => this.submitSelectedAttemptAsFinal()
    );

    this.myScoresOverlay = this.add
      .container(0, 0, [
        shade,
        panel,
        title,
        playerText,
        helperText,
        backButton.rect,
        backButton.text,
        submitButton.rect,
        submitButton.text
      ])
      .setDepth(2300);
  }

  private createMyScoresListElement(
    attempts: RunAttemptEntry[],
    width: number,
    height: number
  ) {
    const root = document.createElement("div");
    root.style.width = `${Math.round(width)}px`;
    root.style.height = `${Math.round(height)}px`;
    root.style.boxSizing = "border-box";
    root.style.padding = `${Math.round(S(8))}px`;
    root.style.border = `${Math.round(S(2))}px solid #0ea5e9`;
    root.style.borderRadius = `${Math.round(S(10))}px`;
    root.style.background = "rgba(224, 242, 254, 0.78)";
    root.style.overflowY = "auto";
    root.style.fontFamily = "Arial, sans-serif";
    root.style.color = "#0f344f";
    root.addEventListener("pointerdown", (event) => event.stopPropagation());
    root.addEventListener("click", (event) => event.stopPropagation());
    root.addEventListener("keydown", (event) => event.stopPropagation());

    if (attempts.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No runs recorded yet.";
      empty.style.height = "100%";
      empty.style.display = "flex";
      empty.style.alignItems = "center";
      empty.style.justifyContent = "center";
      empty.style.fontSize = `${Math.round(S(18))}px`;
      empty.style.fontWeight = "700";
      root.appendChild(empty);
      return root;
    }

    const header = document.createElement("div");
    header.style.display = "grid";
    header.style.gridTemplateColumns = "34px 1fr 110px 150px";
    header.style.gap = `${Math.round(S(8))}px`;
    header.style.alignItems = "center";
    header.style.padding = `${Math.round(S(5))}px ${Math.round(S(8))}px`;
    header.style.fontSize = `${Math.round(S(12))}px`;
    header.style.fontWeight = "800";
    header.style.color = "#075985";
    header.innerHTML = "<span></span><span>Run</span><span>Distance</span><span>Date</span>";
    root.appendChild(header);

    const rows: Array<{ id: string; element: HTMLLabelElement }> = [];
    const refreshRows = () => {
      rows.forEach(({ id, element }) => {
        element.style.background = id === this.selectedAttemptId
          ? "rgba(14, 165, 233, 0.22)"
          : "rgba(255, 255, 255, 0.72)";
        element.style.borderColor = id === this.selectedAttemptId ? "#0284c7" : "#bae6fd";
      });
    };

    attempts.forEach((attempt, index) => {
      const row = document.createElement("label");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "34px 1fr 110px 150px";
      row.style.gap = `${Math.round(S(8))}px`;
      row.style.alignItems = "center";
      row.style.margin = `${Math.round(S(5))}px 0`;
      row.style.padding = `${Math.round(S(7))}px ${Math.round(S(8))}px`;
      row.style.border = `${Math.round(S(2))}px solid #bae6fd`;
      row.style.borderRadius = `${Math.round(S(8))}px`;
      row.style.cursor = "pointer";
      row.style.fontSize = `${Math.round(S(13))}px`;
      row.style.fontWeight = "700";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "final-distance-attempt";
      radio.value = attempt.id;
      radio.checked = attempt.id === this.selectedAttemptId;
      radio.style.width = `${Math.round(S(16))}px`;
      radio.style.height = `${Math.round(S(16))}px`;
      radio.addEventListener("change", () => {
        this.selectedAttemptId = attempt.id;
        refreshRows();
      });

      const run = document.createElement("span");
      run.textContent = `Run ${attempts.length - index}`;
      const distance = document.createElement("span");
      distance.textContent = `${attempt.distance.toLocaleString()}M`;
      distance.style.textAlign = "right";
      const date = document.createElement("span");
      date.textContent = this.formatAttemptDate(attempt.createdAt);
      date.style.textAlign = "right";

      row.append(radio, run, distance, date);
      row.addEventListener("click", () => {
        this.selectedAttemptId = attempt.id;
        radio.checked = true;
        refreshRows();
      });
      rows.push({ id: attempt.id, element: row });
      root.appendChild(row);
    });

    refreshRows();
    return root;
  }

  private closeMyScoresOverlay() {
    this.myScoresDom?.destroy();
    this.myScoresDom = undefined;
    this.myScoresOverlay?.destroy();
    this.myScoresOverlay = undefined;
    this.selectedAttemptId = "";
    this.createGameOverOverlay();
  }

  private submitSelectedAttemptAsFinal() {
    const selectedAttempt = this.loadRunAttemptsForCurrentPlayer().find(
      (attempt) => attempt.id === this.selectedAttemptId
    );

    if (!selectedAttempt) {
      return;
    }

    this.openSubmitDistanceOverlay(selectedAttempt.distance);
  }

  private formatAttemptDate(createdAt: number) {
    return new Date(createdAt).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  private recordRunAttempt() {
    if (this.runAttemptRecorded) {
      return;
    }

    const entry: RunAttemptEntry = {
      id: `${Date.now()}-${Phaser.Math.Between(1000, 9999)}`,
      name: this.playerName || "Runner",
      company: this.companyName,
      distance: Math.floor(this.distance),
      createdAt: Date.now()
    };
    const entries = [...this.loadRunAttempts(), entry]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_LOCAL_RUN_ATTEMPTS);

    this.saveRunAttempts(entries);
    this.runAttemptRecorded = true;
  }

  private loadRunAttemptsForCurrentPlayer() {
    const playerKey = this.submissionIdentityKey(this.playerName || "Runner", this.companyName);

    return this.loadRunAttempts()
      .filter((attempt) => this.submissionIdentityKey(attempt.name, attempt.company) === playerKey)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  private loadRunAttempts(): RunAttemptEntry[] {
    try {
      const stored = window.localStorage.getItem(RUN_ATTEMPTS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((entry): entry is RunAttemptEntry =>
          typeof entry?.id === "string" &&
          typeof entry?.name === "string" &&
          typeof entry?.company === "string" &&
          typeof entry?.distance === "number" &&
          typeof entry?.createdAt === "number"
        )
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          company: entry.company,
          distance: entry.distance,
          createdAt: entry.createdAt
        }))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, MAX_LOCAL_RUN_ATTEMPTS);
    } catch {
      return [];
    }
  }

  private saveRunAttempts(entries: RunAttemptEntry[]) {
    try {
      window.localStorage.setItem(RUN_ATTEMPTS_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Local storage can be unavailable in some browser privacy modes.
    }
  }

  private projectedRank(distance = Math.floor(this.distance)) {
    return this.loadLeaderboard().filter((entry) => entry.distance > distance).length + 1;
  }

  private hasFinalSubmission(name: string, company: string) {
    const playerKey = this.submissionIdentityKey(name, company);

    return this.loadLeaderboard().some(
      (entry) => this.submissionIdentityKey(entry.name, entry.company) === playerKey
    );
  }

  private submissionIdentityKey(name: string, company: string) {
    const normalizedName = name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    const normalizedCompany = company.trim().replace(/\s+/g, " ").toLocaleLowerCase();

    return `${normalizedName}::${normalizedCompany}`;
  }

  private submitFinalDistance(linkedInUrl = "", distance = Math.floor(this.distance)) {
    const rank = this.projectedRank(distance);

    if (this.distanceSubmitted) {
      return rank;
    }

    const entry: LeaderboardEntry = {
      name: this.playerName || "Runner",
      company: this.companyName,
      linkedInUrl,
      distance,
      createdAt: Date.now()
    };
    const entries = [...this.loadLeaderboard(), entry]
      .sort((a, b) => b.distance - a.distance || a.createdAt - b.createdAt)
      .slice(0, MAX_LOCAL_LEADERBOARD_ENTRIES);

    this.saveLeaderboard(entries);
    this.distanceSubmitted = true;

    return rank;
  }

  private loadLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((entry): entry is LeaderboardEntry =>
          typeof entry?.name === "string" &&
          typeof entry?.company === "string" &&
          (typeof entry?.linkedInUrl === "string" || typeof entry?.linkedInUrl === "undefined") &&
          typeof entry?.distance === "number" &&
          typeof entry?.createdAt === "number"
        )
        .map((entry) => ({
          name: entry.name,
          company: entry.company,
          linkedInUrl: entry.linkedInUrl ?? "",
          distance: entry.distance,
          createdAt: entry.createdAt
        }))
        .sort((a, b) => b.distance - a.distance || a.createdAt - b.createdAt)
        .slice(0, MAX_LOCAL_LEADERBOARD_ENTRIES);
    } catch {
      return [];
    }
  }

  private loadBestLeaderboardEntries() {
    const bestByPlayer = new Map<string, LeaderboardEntry>();

    this.loadLeaderboard().forEach((entry) => {
      const key = this.submissionIdentityKey(entry.name, entry.company);
      const currentBest = bestByPlayer.get(key);

      if (!currentBest || entry.distance > currentBest.distance) {
        bestByPlayer.set(key, entry);
      }
    });

    return [...bestByPlayer.values()]
      .sort((a, b) => b.distance - a.distance || a.createdAt - b.createdAt)
      .slice(0, MAX_LOCAL_LEADERBOARD_ENTRIES);
  }

  private saveLeaderboard(entries: LeaderboardEntry[]) {
    try {
      window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Local storage can be unavailable in some browser privacy modes.
    }
  }

  private createLeaderboardOverlay(onBack?: () => void) {
    const entries = this.loadBestLeaderboardEntries();
    const panelWidth = S(760);
    const panelHeight = S(460);
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2;
    const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x03111f, 0.72).setOrigin(0);
    const panel = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff, 0.98)
      .setStrokeStyle(S(3), 0x0284c7);
    const title = this.add
      .text(panelX, panelY - panelHeight / 2 + S(44), "LEADERBOARD", {
        color: "#05345e",
        fontFamily: "Arial, sans-serif",
        fontSize: `${S(28)}px`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const tableTop = panelY - S(122);
    const rankX = panelX - S(315);
    const nameX = panelX - S(235);
    const companyX = panelX - S(55);
    const distanceX = panelX + S(295);
    const headerY = tableTop;
    const rowHeight = entries.length > 10 ? S(24) : S(30);
    const tableItems: Phaser.GameObjects.GameObject[] = [];
    const headerStyle = this.leaderboardHeaderStyle();
    const rowStyle = this.leaderboardRowStyle(entries.length > 10 ? 12 : 14);

    tableItems.push(
      this.add.text(rankX, headerY, "Rank", headerStyle).setOrigin(0, 0.5),
      this.add.text(nameX, headerY, "Name", headerStyle).setOrigin(0, 0.5),
      this.add.text(companyX, headerY, "Company", headerStyle).setOrigin(0, 0.5),
      this.add.text(distanceX, headerY, "Distance", headerStyle).setOrigin(1, 0.5)
    );

    const headerRule = this.add.graphics();
    headerRule.lineStyle(S(2), 0x0ea5e9, 0.65);
    headerRule.lineBetween(rankX, headerY + S(18), distanceX, headerY + S(18));
    tableItems.push(headerRule);

    if (entries.length === 0) {
      tableItems.push(
        this.add
          .text(panelX, tableTop + S(70), "No submitted distances yet.", {
            color: "#0f344f",
            fontFamily: "Arial, sans-serif",
            fontSize: `${S(18)}px`,
            fontStyle: "bold"
          })
          .setOrigin(0.5)
      );
    } else {
      entries.forEach((entry, index) => {
        const y = tableTop + S(42) + index * rowHeight;
        const rowBackground = this.add.graphics();

        if (index % 2 === 0) {
          rowBackground.fillStyle(0xe0f2fe, 0.55);
          rowBackground.fillRoundedRect(rankX - S(10), y - S(14), distanceX - rankX + S(20), S(26), S(6));
        }

        tableItems.push(
          rowBackground,
          this.add.text(rankX, y, `#${index + 1}`, rowStyle).setOrigin(0, 0.5),
          this.add.text(nameX, y, this.truncateForColumn(entry.name, 18), rowStyle).setOrigin(0, 0.5),
          this.add.text(companyX, y, this.truncateForColumn(entry.company || "-", 18), rowStyle).setOrigin(0, 0.5),
          this.add.text(distanceX, y, `${entry.distance.toLocaleString()}M`, rowStyle).setOrigin(1, 0.5)
        );
      });
    }

    let leaderboardOverlay: Phaser.GameObjects.Container;
    const closeButton = this.createGameOverButton(
      panelX,
      panelY + panelHeight / 2 - S(46),
      S(150),
      S(42),
      "Back",
      0x0284c7,
      () => {
        leaderboardOverlay.destroy();
        onBack?.();
      }
    );
    leaderboardOverlay = this.add
      .container(0, 0, [
        shade,
        panel,
        title,
        ...tableItems,
        closeButton.rect,
        closeButton.text
      ])
      .setDepth(2300);
  }

  private leaderboardHeaderStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: "#05345e",
      fontFamily: "Arial, sans-serif",
      fontSize: `${S(14)}px`,
      fontStyle: "bold"
    };
  }

  private leaderboardRowStyle(size = 14): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: "#0f344f",
      fontFamily: "Arial, sans-serif",
      fontSize: `${S(size)}px`,
      fontStyle: "bold"
    };
  }

  private truncateForColumn(value: string, maxLength: number) {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
  }

  private updateFatigueMeter() {
    const barsRemaining = this.fatigueBarsRemaining();
    const x = FATIGUE_METER_X - FATIGUE_METER_WIDTH / 2;
    const y = FATIGUE_METER_Y - FATIGUE_METER_HEIGHT / 2;
    const capWidth = S(9);
    const radius = S(6);
    const padding = S(4);
    const gap = S(3);
    const availableWidth = FATIGUE_METER_WIDTH - padding * 2 - gap * (FATIGUE_TOTAL_BARS - 1);
    const barWidth = availableWidth / FATIGUE_TOTAL_BARS;
    const barHeight = FATIGUE_METER_HEIGHT - padding * 2;
    const fillColor = barsRemaining > 5 ? 0x22c55e : barsRemaining > 2 ? 0xfacc15 : 0xef4444;
    const isBlinking = this.time.now < this.fatigueBlinkUntil;
    const blinkOn = isBlinking && Math.floor(this.time.now / 90) % 2 === 0;
    const outlineColor = blinkOn ? 0xffffff : 0xe0f2fe;
    const activeFillColor = blinkOn ? 0x7dd3fc : fillColor;
    const borderAlpha = blinkOn ? 1 : 0.92;

    this.fatigueMeter.clear();
    if (blinkOn) {
      this.fatigueMeter.fillStyle(0x38bdf8, 0.22);
      this.fatigueMeter.fillRoundedRect(
        x - S(5),
        y - S(5),
        FATIGUE_METER_WIDTH + S(10),
        FATIGUE_METER_HEIGHT + S(10),
        S(9)
      );
    }

    this.fatigueMeter.fillStyle(0x031a31, 0.66);
    this.fatigueMeter.fillRoundedRect(x, y, FATIGUE_METER_WIDTH, FATIGUE_METER_HEIGHT, radius);
    this.fatigueMeter.fillRoundedRect(
      x + FATIGUE_METER_WIDTH + S(1),
      y + FATIGUE_METER_HEIGHT * 0.26,
      capWidth,
      FATIGUE_METER_HEIGHT * 0.48,
      S(2)
    );
    this.fatigueMeter.lineStyle(S(blinkOn ? 3 : 2), outlineColor, borderAlpha);
    this.fatigueMeter.strokeRoundedRect(x, y, FATIGUE_METER_WIDTH, FATIGUE_METER_HEIGHT, radius);

    for (let index = 0; index < FATIGUE_TOTAL_BARS; index += 1) {
      const barX = x + padding + index * (barWidth + gap);
      this.fatigueMeter.fillStyle(
        index < barsRemaining ? activeFillColor : 0x0f2538,
        index < barsRemaining ? 0.96 : 0.72
      );
      this.fatigueMeter.fillRoundedRect(barX, y + padding, barWidth, barHeight, S(2));
    }
  }

  private fatigueBarsRemaining() {
    return Phaser.Math.Clamp(
      Math.ceil(this.fatigueSecondsRemaining / FATIGUE_BAR_INTERVAL_SECONDS),
      0,
      FATIGUE_TOTAL_BARS
    );
  }

  private isFatigueEmpty() {
    return this.fatigueSecondsRemaining <= 0;
  }

  private updateHud() {
    const timerFillColor = this.timerFillColor();
    const timerIsOrange = timerFillColor === 0xea580c;

    this.timerCover.clear();
    this.timerCover.fillStyle(timerFillColor, 0.96);
    this.timerCover.fillRoundedRect(HUD_X, TIMER_Y, TIMER_WIDTH, TIMER_HEIGHT, S(14));
    this.timerCover.lineStyle(S(3), timerIsOrange ? 0xffd08a : 0x18a9ee, 0.98);
    this.timerCover.strokeRoundedRect(HUD_X, TIMER_Y, TIMER_WIDTH, TIMER_HEIGHT, S(14));

    this.hudCover.clear();
    this.hudCover.fillStyle(0x05345e, 0.95);
    this.hudCover.fillRoundedRect(HUD_X, HUD_Y, HUD_WIDTH, HUD_HEIGHT, S(14));
    this.hudCover.lineStyle(S(3), 0x18a9ee, 0.95);
    this.hudCover.strokeRoundedRect(HUD_X, HUD_Y, HUD_WIDTH, HUD_HEIGHT, S(14));

    this.hudCover.fillStyle(0x075c9a, 0.92);
    this.hudCover.fillRoundedRect(HUD_X + S(10), HUD_Y + S(9), HUD_WIDTH - S(20), S(30), S(10));
    this.hudCover.fillStyle(0x083f70, 0.96);
    this.hudCover.fillRoundedRect(HUD_X + S(10), HUD_Y + S(48), HUD_WIDTH - S(20), S(40), S(10));

    this.timerText.setText(`\u23f1 ${this.formattedRemainingTime()}`);
    this.timerRunnerText.setText(this.started ? `Keep Running ${this.shortPlayerName()}` : "");
    this.hudLives.setText(`LIVES ${this.lives}`);
    this.hudDistance.setText(`${Math.floor(this.distance).toLocaleString()}M`);
  }

  private timerFillColor() {
    if (!this.started || this.isGameOver) {
      return 0x05345e;
    }

    return Math.floor(this.challengeElapsed * 2) % 2 === 0 ? 0x05345e : 0xea580c;
  }

  private shortPlayerName() {
    const name = this.playerName || "Runner";

    return name.length > 18 ? `${name.slice(0, 17)}...` : name;
  }

  private formattedRemainingTime() {
    const secondsRemaining = Math.max(
      0,
      Math.ceil(CHALLENGE_DURATION_SECONDS - this.challengeElapsed)
    );
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  private hudTextStyle(size: number): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
      fontSize: `${S(size)}px`,
      fontStyle: "bold",
      stroke: "#031a31",
      strokeThickness: S(4)
    };
  }

  private hudLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: "#b9efff",
      fontFamily: "Arial, sans-serif",
      fontSize: `${S(13)}px`,
      fontStyle: "bold",
      stroke: "#031a31",
      strokeThickness: S(3)
    };
  }

  private setHudVisible(visible: boolean) {
    this.setOnScreenControlsVisible(visible && this.started && !this.isGameOver);

    [
      this.timerCover,
      this.timerText,
      this.timerRunnerText,
      this.hudCover,
      this.hudLives,
      this.hudDistance,
      this.fatigueMeter,
      ...this.hudStaticLabels
    ].forEach((item) => item.setVisible(visible));
  }

  private startFieldLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: "#075985",
      fontFamily: "Arial, sans-serif",
      fontSize: `${S(14)}px`,
      fontStyle: "bold"
    };
  }

  private setRunnerRunDisplay() {
    this.runner.setDisplaySize(S(122), S(160));
  }

  private setRunnerFallenDisplay(width: number, height: number) {
    this.runner.setTexture("runner_slide");
    this.runner.setOrigin(0.5, 1);
    this.runner.setDisplaySize(width, height);
    this.runner.setY(FALLEN_RUNNER_GROUND_Y);
    this.runner.setVelocity(0, 0);
  }

  private createAlignmentDebug() {
    if (!SHOW_ALIGNMENT_DEBUG) {
      return;
    }

    this.add
      .line(0, 0, 0, GROUND_Y, GAME_WIDTH, GROUND_Y, 0xff2d55, 0.9)
      .setOrigin(0)
      .setDepth(3000);
  }
}
