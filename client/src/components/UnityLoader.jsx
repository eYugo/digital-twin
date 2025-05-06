import React, { useEffect } from 'react';

export default function UnityLoader() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/unity/Build/UnityLoader.js';
        script.onload = () => {
            if (window.UnityLoader) {
                window.UnityLoader.instantiate(
                    'unityContainer',
                    '/unity/Build/Build.json'
                );
            } else {
                console.error('UnityLoader is not defined');
            }
        };
        script.onerror = () => {
            console.error('Failed to load UnityLoader.js');
        };
        document.body.appendChild(script);
    }, []);

    return <div id="unityContainer" style={{ width: '100%', height: '100%' }} />;
}