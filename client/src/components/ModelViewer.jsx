import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model() {
    const { scene } = useGLTF('/models/model.gltf');
    return <primitive object={scene} />;
}

export default function ModelViewer() {
    return (
        <Canvas>
            <Suspense fallback={null}>
                <Model />
                <OrbitControls />
            </Suspense>
        </Canvas>
    );
}