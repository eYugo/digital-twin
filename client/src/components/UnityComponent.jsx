import React, { useEffect, useRef } from 'react';

const UnityComponent = () => {
    const unityContainerRef = useRef(null);

    useEffect(() => {
        console.log('UnityComponent mounted');
        const script = document.createElement('script');
        script.src = 'unityBuild/Build/unityBuild.loader.js'; // Adjust the path as needed
        script.onload = () => {
            console.log('Unity loader script loaded');
            window.createUnityInstance(unityContainerRef.current, {
                dataUrl: 'unityBuild/Build/unityBuild.data',
                frameworkUrl: 'unityBuild/Build/unityBuild.framework.js',
                codeUrl: 'unityBuild/Build/unityBuild.wasm',
                streamingAssetsUrl: "StreamingAssets",
                companyName: "DefaultCompany",
                productName: "MyProductName",
                productVersion: "1.0",
            }).then((unityInstance) => {
                console.log('Unity instance loaded');
            }).catch((message) => {
                console.error('Error loading Unity instance:', message);
            });
        };
        script.onerror = () => {
            console.error('Error loading Unity loader script');
        };
        document.body.appendChild(script);

        return () => {
            console.log('UnityComponent unmounted');
            document.body.removeChild(script);
        };
    }, []);

    return <div id="unityContainer" ref={unityContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default UnityComponent;