import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float, Html } from '@react-three/drei';
import { useScroll } from 'framer-motion';
import * as THREE from 'three';

// Preload the model
useGLTF.preload('/robot_arm.glb');

function RobotModel({ scrollYProgress }: { scrollYProgress: any }) {
    const { scene } = useGLTF('/robot_arm.glb');
    const groupRef = useRef<THREE.Group>(null);
    const [isEntering, setIsEntering] = React.useState(false);
    const enterProgress = useRef(0);

    React.useEffect(() => {
        const handleEnter = () => setIsEntering(true);
        window.addEventListener('enter-vortex', handleEnter);
        return () => window.removeEventListener('enter-vortex', handleEnter);
    }, []);

    // Set initial materials to match the cinematic dark/silver/gold aesthetic
    React.useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Optional: tweak materials for a darker, more cinematic look
                // child.material.metalness = 0.8;
                // child.material.roughness = 0.2;
                // child.material.envMapIntensity = 1.0;
            }
        });
    }, [scene]);

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

            // Glide softly to dead center
            groupRef.current.position.y += (0 - groupRef.current.position.y) * 0.08;
            groupRef.current.position.x += (0 - groupRef.current.position.x) * 0.08;

            // Push into camera lens smoothly, accelerating to envelope the screen
            groupRef.current.position.z += delta * (4 + easeIn * 30);

            // Slowly rotate to face the camera straight on
            groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.05;
            groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.05;
            return;
        }

        // Map scroll progress (0 to 1) to rotation and position
        const scroll = scrollYProgress.get();

        // Smooth interpolation could be done with framer-motion useSpring, 
        // but direct application of scroll works if scroll is smooth.
        // Initial rotation: facing left/front.
        const targetRotationY = -Math.PI / 4 + scroll * Math.PI * 2;
        const targetRotationX = scroll * 0.5;

        // Movement: Starts right, moves to center-left
        const targetPositionX = 3 - scroll * 5;
        const targetPositionY = -2 + scroll * 1.5;

        // Apply lerp for smooth stopping
        groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
        groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
        groupRef.current.position.x += (targetPositionX - groupRef.current.position.x) * 0.1;
        groupRef.current.position.y += (targetPositionY - groupRef.current.position.y) * 0.1;
    });

    return (
        <group ref={groupRef} position={[3, -2, -2]} scale={2.5}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <primitive object={scene} />

                {/* Pointer 1: Perception */}
                <Html position={[0, 1.5, 0]} center className="pointer-events-none opacity-0 transition-opacity duration-500" style={{ opacity: scrollYProgress.get() > 0.1 && scrollYProgress.get() < 0.3 ? 1 : 0 }}>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8B84B] animate-ping absolute" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" />
                        <div className="h-[1px] w-12 bg-white/30" />
                        <span className="text-[10px] uppercase tracking-widest text-white font-mono bg-[#0c0c0c]/80 border border-white/[0.07] px-2 py-1 backdrop-blur-md">Perception</span>
                    </div>
                </Html>

                {/* Pointer 2: Planning */}
                <Html position={[-1, 0.5, 1]} center className="pointer-events-none opacity-0 transition-opacity duration-500" style={{ opacity: scrollYProgress.get() > 0.4 && scrollYProgress.get() < 0.6 ? 1 : 0 }}>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#E8B84B] font-mono bg-[#0c0c0c]/80 border border-[#E8B84B]/30 px-2 py-1 backdrop-blur-md">Planning</span>
                        <div className="h-[1px] w-12 bg-[#E8B84B]/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" />
                    </div>
                </Html>

                {/* Pointer 3: Control */}
                <Html position={[1, -0.5, 1]} center className="pointer-events-none opacity-0 transition-opacity duration-500" style={{ opacity: scrollYProgress.get() > 0.7 && scrollYProgress.get() < 0.9 ? 1 : 0 }}>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <div className="h-[1px] w-16 bg-emerald-500/50" />
                        <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono bg-[#0c0c0c]/80 border border-emerald-500/30 px-2 py-1 backdrop-blur-md">Control</span>
                    </div>
                </Html>
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
