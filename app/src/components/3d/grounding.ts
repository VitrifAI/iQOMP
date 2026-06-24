import * as THREE from 'three';

/**
 * Returns the Y offset needed so that a centered geometry, after the given
 * rotation is applied, rests with its lowest point on the ground plane (y = 0).
 * This keeps objects "snapped" to the table whether upright or laid on a side.
 */
export function groundedYFor(
  geometry: THREE.BufferGeometry,
  rotation: [number, number, number]
): number {
  geometry.computeBoundingBox();
  if (!geometry.boundingBox) return 0;
  const bb = geometry.boundingBox.clone();
  bb.applyMatrix4(
    new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(rotation[0], rotation[1], rotation[2])
    )
  );
  return -bb.min.y;
}
