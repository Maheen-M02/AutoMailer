/**
 * Lightweight CSS-based animated mesh gradient background.
 * Replaces the heavy canvas-based particle animation for much better performance.
 */
export function DynamicBackground() {
  return (
    <>
      {/* Primary mesh gradient layer (CSS-only, no JS) */}
      <div className="mesh-gradient" aria-hidden="true" />

      {/* Extra accent glow for landing/login pages */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        aria-hidden="true"
      >
        {/* Top-center indigo radial */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Bottom-right violet radial */}
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.05) 0%, transparent 70%)",
          }}
        />
      </div>
    </>
  );
}
