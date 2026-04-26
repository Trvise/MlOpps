import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float, useAnimations } from '@react-three/drei';
import { useScroll } from 'framer-motion';
import * as THREE from 'three';

// Preload the model
useGLTF.preload('/RobotExpressive.glb');

function RobotModel({ scrollYProgress }: { scrollYProgress: any }) {
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

    // Play idle animation and force cinematic materials
    React.useEffect(() => {
        if (actions['Idle']) {
            actions['Idle'].reset().play();
        }

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Force an insanely dark, reflective sci-fi aesthetic
                const newMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color('#050505'),
                    metalness: 0.9,
                    roughness: 0.2,
                    envMapIntensity: 2.0,
                });
                child.material = newMat;
            }
        });
    }, [scene, actions]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        if (isEntering) {
            enterProgress.current += delta;

            // Elegant Cinematic Sequence:
            // 1. Smoothly glide to center frame
            // 2. Rotate gracefully toward the viewer
            // 3. Scale and push through the camera lens at the very end
            const p = Math.min(enterProgress.current / 1.2, 1);
            const easeIn = p * p * p; // cubic ease in for zoom

            // Glide softly to dead center horizontally, but drop Y significantly to target the brain area
            groupRef.current.position.y += (-3.5 - groupRef.current.position.y) * 0.08;
            groupRef.current.position.x += (0 - groupRef.current.position.x) * 0.08;

            // Push into camera lens smoothly, accelerating to envelope the screen
            groupRef.current.position.z += delta * (4 + easeIn * 30);

            // Slowly rotate to face the camera straight on
            groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.05;
            groupRef.current.rotation.x += (0.1 - groupRef.current.rotation.x) * 0.05;
            return;
        }

        const scroll = scrollYProgress.get();

        // Detect active scrolling state via delta
        if (Math.abs(scroll - lastScroll.current) > 0.0001) {
            scrollTimer.current = 0.15; // 150ms buffer
        } else {
            scrollTimer.current = Math.max(0, scrollTimer.current - delta);
        }
        lastScroll.current = scroll;

        const isActivelyScrolling = scrollTimer.current > 0;

        // Cap the movement to the first 40% of the page
        const turnProgress = Math.min(scroll / 0.4, 1);

        // Base Movement: Smoothly float and rotate the entire humanoid based on turnProgress
        const targetPositionX = 0; // Perfectly centered on screen
        const targetPositionY = -2.5 + turnProgress * 1.5; // Rise up slightly while walking
        groupRef.current.position.x += (targetPositionX - groupRef.current.position.x) * 0.1;
        groupRef.current.position.y += (targetPositionY - groupRef.current.position.y) * 0.1;

        const baseTargetRotY = -Math.PI / 4 - turnProgress * Math.PI; // Dramatic spin to face user
        groupRef.current.rotation.y += (baseTargetRotY - groupRef.current.rotation.y) * 0.05;

        // Tilt forward slightly during walk
        const targetRotX = turnProgress * 0.2;
        groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.1;

        // Dynamically blend between Idle and Walking only during the turn phase
        const walkAction = actions['Walking'];
        const idleAction = actions['Idle'];

        if (walkAction && idleAction) {
            const isWalkingPhase = scroll > 0.01 && scroll < 0.4 && isActivelyScrolling;
            // Fast toggle between walk cycle vs idle
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

export default function RobotCanvas() {
    const { scrollYProgress } = useScroll();

    return (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                <directionalLight position={[-10, 10, -5]} intensity={1} color="#E8B84B" />
                <pointLight position={[0, -5, 5]} intensity={1.5} color="#1A3BFF" />

                <Environment preset="city" />

                <React.Suspense fallback={null}>
                    <RobotModel scrollYProgress={scrollYProgress} />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
