import * as THREE from 'three';

export function createDiya(scene) {
  const diyaGroup = new THREE.Group();

  const terracottaMat = new THREE.MeshStandardMaterial({
    color: 0xb8632a,
    flatShading: true,
    roughness: 0.85,
    metalness: 0.1,
  });

  const warliWhiteMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const wickMat = new THREE.MeshBasicMaterial({ color: 0x221100 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

  const profilePoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.35, 0.05),
    new THREE.Vector2(1.1, 0.45),
    new THREE.Vector2(1.0, 0.8),
    new THREE.Vector2(0.85, 0.8),
    new THREE.Vector2(0.75, 0.35),
    new THREE.Vector2(0, 0.25),
  ];

  const latheGeo = new THREE.LatheGeometry(profilePoints, 12);

  const posAttr = latheGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const z = posAttr.getZ(i);
    const y = posAttr.getY(i);
    if (z > 0.3 && y > 0.3) {
      posAttr.setZ(i, z * 1.35);
      posAttr.setY(i, y * 1.1);
    }
  }
  latheGeo.computeVertexNormals();

  const bowlMesh = new THREE.Mesh(latheGeo, terracottaMat);
  diyaGroup.add(bowlMesh);

  const patternGroup = new THREE.Group();
  const numPatterns = 10;
  const radius = 0.98;

  for (let i = 0; i < numPatterns; i++) {
    const angle = (i / numPatterns) * Math.PI * 1.75 - Math.PI * 0.875;

    const triGeo = new THREE.ConeGeometry(0.08, 0.16, 3);
    const triMesh = new THREE.Mesh(triGeo, warliWhiteMat);
    triMesh.position.set(
      Math.sin(angle) * radius,
      0.52,
      Math.cos(angle) * radius
    );
    triMesh.rotation.y = angle;
    triMesh.rotation.x = 0.3;
    patternGroup.add(triMesh);

    const dotGeo = new THREE.CircleGeometry(0.025, 6);
    const dotMesh = new THREE.Mesh(dotGeo, warliWhiteMat);
    const dotAngle = angle + (Math.PI * 1.75 / numPatterns) / 2;
    dotMesh.position.set(
      Math.sin(dotAngle) * (radius - 0.02),
      0.66,
      Math.cos(dotAngle) * (radius - 0.02)
    );
    dotMesh.rotation.y = dotAngle;
    patternGroup.add(dotMesh);
  }
  diyaGroup.add(patternGroup);

  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.05, 0.25, 6),
    wickMat
  );
  wick.position.set(0, 0.35, 0.95);
  wick.rotation.x = Math.PI / 6;
  diyaGroup.add(wick);

  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.32, 6),
    flameMat
  );
  flame.position.set(0, 0.52, 1.02);
  diyaGroup.add(flame);

  const flameLight = new THREE.PointLight(0xff7700, 2.5, 4);
  flameLight.position.set(0, 0.58, 1.02);
  diyaGroup.add(flameLight);

  scene.add(diyaGroup);

  const initialY = diyaGroup.position.y;

  return function updateDiya(time) {
    diyaGroup.rotation.y = time * 0.4;
    diyaGroup.position.y = initialY + Math.sin(time * 2.0) * 0.12;
    diyaGroup.rotation.z = Math.sin(time * 1.5) * 0.05;
    diyaGroup.rotation.x = Math.cos(time * 1.5) * 0.03;

    const flicker = Math.sin(time * 18.0) * 0.08;
    flame.scale.set(1 + flicker, 1 + Math.cos(time * 14.0) * 0.1, 1 + flicker);
    flameLight.intensity = 2.2 + Math.sin(time * 22.0) * 0.5;
  };
}