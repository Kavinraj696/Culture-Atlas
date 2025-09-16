// ✅ Replace with your valid Cesium Ion access token
import React, { useEffect, useRef } from 'react';
import {
  Viewer,
  Ion,
  IonImageryProvider,
  Cartesian3,
  Math as CesiumMath,
  Color,
  ScreenSpaceEventType,
  defined
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// ✅ Replace with your valid Cesium Ion access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OGU0ZTVhMy01ZGM5LTQyY2YtOWQ3Mi00MjgwODEzNGEzOWIiLCJpZCI6MzM3NTE4LCJpYXQiOjE3NTY4MDc3MTh9.H1a84jOgJZx6UzR64XN0I4Ddp6PSbUAOJKXjFi0hAiI';

function App() {
  const cesiumContainer = useRef(null);

  useEffect(() => {
    let viewer;

    async function initCesium() {
      if (!cesiumContainer.current) return;

      try {
        window.CESIUM_BASE_URL = '/Cesium';

        viewer = new Viewer(cesiumContainer.current, {
          baseLayerPicker: false,
          timeline: false,
          animation: false,
          infoBox: true,
          selectionIndicator: true
        });

        viewer.scene.globe.show = true;

        const baseLayer = viewer.imageryLayers.get(0);
        if (baseLayer) viewer.imageryLayers.remove(baseLayer);

        const imageryProvider = await IonImageryProvider.fromAssetId(3);
        viewer.imageryLayers.addImageryProvider(imageryProvider);

        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(78.9629, 20.5937, 1500000),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-45),
            roll: 0.0,
          },
        });

        const response = await fetch("http://localhost:4000/api/cultures");
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const data = await response.json();

        data
          .filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number')
          .forEach(culture => {
            viewer.entities.add({
              name: culture.name,
              position: Cartesian3.fromDegrees(culture.longitude, culture.latitude),
              point: {
                pixelSize: 12,
                color: Color.RED,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
              },
              description: `
                <div style="font-family: sans-serif; line-height:1.4">
                  <h3>${culture.name}</h3>
                  <p>${culture.description || ""}</p>
                  ${culture.mediaUrl ? `<img src="${culture.mediaUrl}" width="240" style="margin-top:8px; border-radius:6px" />` : ""}
                </div>
              `
            });
          });

        viewer.screenSpaceEventHandler.setInputAction((movement) => {
          const pickedObject = viewer.scene.pick(movement.position);
          console.log("Picked object:", pickedObject); // ✅ Debug Tip
          if (defined(pickedObject) && pickedObject.id) {
            viewer.selectedEntity = pickedObject.id;
          }
        }, ScreenSpaceEventType.LEFT_CLICK);

      } catch (error) {
        console.error('Cesium setup failed:', error);
      }
    }

    const timeout = setTimeout(() => {
      initCesium();
    }, 0);

    return () => {
      clearTimeout(timeout);
      if (viewer) viewer.destroy();
    };
  }, []);

  return <div ref={cesiumContainer} style={{ width: '100vw', height: '100vh' }} />;
}

export default App;

