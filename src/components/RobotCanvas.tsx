import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float, useAnimations } from '@react-three/drei';
import { useScroll } from 'framer-motion';
import * as THREE from 'three';

// Preload the model
useGLTF.preload('/RobotExpressive.glb');

function RobotModel({ scrollYProgress, isLightMode }: { scrollYProgress: any; isLightMode?: boolean }) {
    const { scene, animations } = useGLTF('/RobotExpressive.glb');
    const groupRef = useRef<THREE.Group>(null);
    const { actions } = useAnimations(animations, groupRef);
    const [isEntering, setIsEntering] = React.useState(false);
    const enterProgress = useRef(0);
    const lastScroll = useRef(0);
    const scrollTimer = useRef(0);

    React.useEffect(() => {
        const handleEnter = () => setIsEntering(true);
        window.addEventListener('enter-vortex', handleEnter);
        return () => window.removeEventListener('enter-vortex', handleEnter);
    }, []);

    // Play idle animation and dynamically update materials for light/dark mode
    React.useEffect(() => {
        if (actions['Idle']) {
            actions['Idle'].reset().play();
        }

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Adaptive shader based on theme
                const baseColor = isLightMode ? '#cfcfcf' : '#050505';
                const metalness = isLightMode ? 0.6 : 0.9;
                const newMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(baseColor),
                    metalness: metalness,
                    roughness: 0.2,
                    envMapIntensity: isLightMode ? 0.8 : 2.0,
                });
                child.material = newMat;
            }
        });
    }, [scene, actions, isLightMode]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        if (isEntering) {
            enterProgress.current += delta;
            const p = Math.min(enterProgress.current / 1.2, 1);
            const easeIn = p * p * p;
            groupRef.current.position.y += (-3.5 - groupRef.current.position.y) * 0.08;
            groupRef.current.position.x += (0 - groupRef.current.position.x) * 0.08;
            groupRef.current.position.z += delta * (4 + easeIn * 30);
            groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.05;
            groupRef.current.rotation.x += (0.1 - groupRef.current.rotation.x) * 0.05;
            return;
        }

        const scroll = scrollYProgress.get();
        if (Math.abs(scroll - lastScroll.current) > 0.0001) {
            scrollTimer.current = 0.15;
        } else {
            scrollTimer.current = Math.max(0, scrollTimer.current - delta);
        }
        lastScroll.current = scroll;

        const isActivelyScrolling = scrollTimer.current > 0;
        const turnProgress = Math.min(scroll / 0.4, 1);
        const targetPositionX = 0;
        const targetPositionY = -2.5 + turnProgress * 1.5;
        groupRef.current.position.x += (targetPositionX - groupRef.current.position.x) * 0.1;
        groupRef.current.position.y += (targetPositionY - groupRef.current.position.y) * 0.1;

        const baseTargetRotY = -Math.PI / 4 - turnProgress * Math.PI;
        groupRef.current.rotation.y += (baseTargetRotY - groupRef.current.rotation.y) * 0.05;

        const targetRotX = turnProgress * 0.2;
        groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.1;

        const walkAction = actions['Walking'];
        const idleAction = actions['Idle'];

        if (walkAction && idleAction) {
            const isWalkingPhase = scroll > 0.01 && scroll < 0.4 && isActivelyScrolling;
            if (isWalkingPhase && !walkAction.isRunning()) {
                walkAction.reset().play();
                walkAction.crossFadeFrom(idleAction, 0.5, true);
            } else if (!isWalkingPhase && walkAction.isRunning()) {
                idleAction.reset().play();
                idleAction.crossFadeFrom(walkAction, 0.5, true);
            }
        }
    });

    return (
        <group ref={groupRef} position={[0, -2.5, -2]} scale={2.2}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <primitive object={scene} />
            </Float>
        </group>
    );
}

export default function RobotCanvas({ isLightMode = false }: { isLightMode?: boolean }) {
    const { scrollYProgress } = useScroll();

    return (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
                <ambientLight intensity={isLightMode ? 2.5 : 0.5} />
                <directionalLight position={[10, 10, 5]} intensity={isLightMode ? 3 : 2} color="#ffffff" />
                <directionalLight position={[-10, 10, -5]} intensity={1} color="#E8B84B" />
                <pointLight position={[0, -5, 5]} intensity={isLightMode ? 0.5 : 1.5} color="#1A3BFF" />

                <Environment preset={isLightMode ? "studio" : "city"} />

                <React.Suspense fallback={null}>
                    <RobotModel scrollYProgress={scrollYProgress} isLightMode={isLightMode} />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
