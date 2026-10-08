"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { cans, drawLabel, LABEL_H, LABEL_W, type CanSpec } from "./labels";

// Slim 250ml can: 2 units wide, ~5 tall. Profile is (radius, height).
const BODY_BOTTOM = 0.28;
const BODY_TOP = 4.55;
const PROFILE: [number, number][] = [
  [0, 0.2], [0.5, 0.1], [0.76, 0.0], [0.86, 0.0], [0.93, 0.05], [0.98, 0.16],
  [1, BODY_BOTTOM], [1, BODY_TOP], [0.975, 4.66], [0.93, 4.8], [0.89, 4.9],
  [0.885, 4.97], [0.905, 5.01], [0.905, 5.05], [0.885, 5.075], [0.86, 5.055],
  [0.85, 5.0], [0.83, 4.95], [0, 4.95],
];

function useLabelTexture(spec: CanSpec, family: string | null) {
  // Painting the label is synchronous, so derive the texture during render.
  const texture = useMemo(() => {
    if (!family) return null;
    const canvas = document.createElement("canvas");
    canvas.width = LABEL_W;
    canvas.height = LABEL_H;
    drawLabel(canvas.getContext("2d")!, spec, family);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, [spec, family]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

function Can({ spec, family }: { spec: CanSpec; family: string | null }) {
  const label = useLabelTexture(spec, family);
  const shell = useMemo(
    () => new THREE.LatheGeometry(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), 160),
    [],
  );
  useEffect(() => {
    // Signals scripts/render-cans.mjs that the can is ready to capture.
    if (label) document.body.dataset.canReady = "true";
  }, [label]);
  if (!label) return null;
  return (
    <group position={[0, -2.54, 0]}>
      <mesh geometry={shell}>
        <meshStandardMaterial color="#d7dade" metalness={1} roughness={0.22} />
      </mesh>
      {/* thetaStart = PI puts the label's horizontal centre on the front */}
      <mesh position={[0, (BODY_BOTTOM + BODY_TOP) / 2, 0]}>
        <cylinderGeometry
          args={[1.003, 1.003, BODY_TOP - BODY_BOTTOM, 192, 1, true, Math.PI]}
        />
        <meshPhysicalMaterial
          map={label}
          metalness={spec.metalness}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>
      {/* Pull tab */}
      <mesh position={[0, 4.985, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.16, 0.42, 6, 24]} />
        <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Lights() {
  return (
    <Environment resolution={512} frames={1}>
      {/* Mid-grey surroundings keep the metal from reflecting pure black */}
      <color attach="background" args={["#6d7076"]} />
      {/* Tall softboxes give the vertical highlight streaks of a product shot */}
      <Lightformer form="rect" intensity={3} position={[-5, 0, 3]} scale={[1.5, 14, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={2} position={[5, 0, 2]} scale={[1, 14, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.2} position={[0, 0, 6]} scale={[6, 14, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={2} position={[0, 8, 0]} scale={[8, 8, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.6} position={[0, 0, -6]} scale={[10, 14, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}

function CanView({
  spec,
  family,
  exportMode,
}: {
  spec: CanSpec;
  family: string | null;
  exportMode: boolean;
}) {
  return (
    <Canvas
      dpr={2}
      flat={false}
      gl={{
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        toneMapping: THREE.NeutralToneMapping,
      }}
      camera={{ fov: 12, position: [0, 1.6, 26] }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      style={{ width: 480, height: 1200 }}
      data-can={spec.id}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[-3, 5, 6]} intensity={1.2} />
      <Lights />
      <Can spec={spec} family={family} />
      {!exportMode && <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2 - 0.4} maxPolarAngle={Math.PI / 2 + 0.2} />}
    </Canvas>
  );
}

const noop = () => () => {};

export function CanStudio({ fontFamily }: { fontFamily: string }) {
  const [family, setFamily] = useState<string | null>(null);
  // ?can=volt renders a single can for scripts/render-cans.mjs
  const only = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("can"),
    () => null,
  );

  useEffect(() => {
    // Canvas text only uses a web font once it has actually loaded.
    Promise.all(
      [600, 700, 800].map((w) => document.fonts.load(`${w} 100px ${fontFamily}`)),
    ).then(() => setFamily(fontFamily));
  }, [fontFamily]);

  const list = only ? cans.filter((c) => c.id === only) : cans;

  return (
    <div className={only ? "" : "flex flex-wrap gap-6 p-6"}>
      {list.map((spec) => (
        <figure key={spec.id} className="flex flex-col items-center gap-3">
          <CanView spec={spec} family={family} exportMode={Boolean(only)} />
          {!only && (
            <button
              className="rounded-full border border-current px-4 py-1.5 text-sm"
              onClick={() => {
                const canvas = document.querySelector<HTMLCanvasElement>(
                  `[data-can="${spec.id}"] canvas`,
                );
                if (!canvas) return;
                const a = document.createElement("a");
                a.href = canvas.toDataURL("image/png");
                a.download = `${spec.id}.png`;
                a.click();
              }}
            >
              Download {spec.id}.png
            </button>
          )}
        </figure>
      ))}
    </div>
  );
}
