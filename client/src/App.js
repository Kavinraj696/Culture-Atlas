// ✅ Replace with your valid Cesium Ion access token
import React, { useEffect, useRef } from 'react';
import './index.css';
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
import { API_BASE } from './config';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './App.css';
// ✅ Replace with your valid Cesium Ion access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMGMxM2VmZC02M2QwLTRlZTItOGZjNC0zMTE0OTAzYmE2ZmEiLCJpZCI6MzYyMDU0LCJpYXQiOjE3NjM2MTc2Mzh9.nfUi3za00okBxtUwT1z-P8dc_eY6op5Q2qGF_Pd7UsA';
<iframe src="about:blank" sandbox="allow-scripts" title="Empty sandbox frame"></iframe>


function App() {
  const cesiumContainer = useRef(null);
  const navigatetofestform = ()=>{
    window.location.href = '/form.html'; 
  };
  const navigatetofestsearch = ()=>{
    window.location.href = '/search.html'; 
  };
  const navigatetohistsearch = ()=>{
    window.location.href = 'search_hist.html'; 
  };
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

        // Remove default imagery
        const baseLayer = viewer.imageryLayers.get(0);
        if (baseLayer) viewer.imageryLayers.remove(baseLayer);

        // Add Cesium base imagery
        const imageryProvider = await IonImageryProvider.fromAssetId(3);
        viewer.imageryLayers.addImageryProvider(imageryProvider);

        // Fly camera to Earth
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(73.2090, 8.6139, 1200000), // zoomed out for global view
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-20),
            roll: 0.0,
          },
        });

        // ✅ Fetch today's festivals from backend
        const response = await fetch(`${API_BASE}/api/cultures`);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const festivals = await response.json();
        
        // Add festival pins
        festivals
          .filter(f => typeof f.latitude === 'number' && typeof f.longitude === 'number')
          .forEach(festival => {
            viewer.entities.add({
              name: festival.name,
              position: Cartesian3.fromDegrees(festival.longitude, festival.latitude),
              point: {
                pixelSize: 13,
                color: Color.ORANGE,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
              },
              description: `
                <div style="font-family: sans-serif; line-height:1.4">
                  <h3>${festival.festival_name}</h3>
                  <p><strong>Location:</strong> ${festival.country}</p>
                  <p>${festival.note || festival.Note}</p>
                  <p><strong>Date:</strong> ${festival.date +" "+ festival.month || "Variable"}</p>
                </div>
              `
            });
          });

        // Handle marker click
        viewer.screenSpaceEventHandler.setInputAction((movement) => {
          const pickedObject = viewer.scene.pick(movement.position);
          console.log("Picked object:", pickedObject);
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

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div className="button-container">
      <button onClick={navigatetofestform}>Add Festival</button>
      <button onClick={navigatetofestsearch}>Search</button>
      <button onClick={navigatetohistsearch}>History</button>
        
      </div>
      <div
        ref={cesiumContainer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
    </div>
  );
  
  
  
  
}

export default App;

