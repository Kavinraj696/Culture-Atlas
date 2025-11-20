// client/src/components/CultureLayer.jsx
import { useEffect, useState } from "react";
import { Entity } from "resium";
import { Cartesian3, Color } from "cesium";

export default function CultureLayer() {
  const [cultures, setCultures] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/cultures")
      .then(res => res.json())
      .then(data => setCultures(data))
      .catch(err => console.error("Error fetching cultures:", err));
  }, []);

  return (
    <>
      {cultures
        .filter(c => c.latitude && c.longitude)
        .map(culture => (
          <Entity
            key={culture._id}
            name={culture.festival_name}
            position={Cartesian3.fromDegrees(culture.longitude, culture.latitude)}
            point={{ pixelSize: 10, color: Color.RED }}
            description={`
              <h3>${culture.festival_name}</h3>
              <p>${culture.note || culture.Note}</p>
              ${culture.mediaUrl ? `<img src="${culture.mediaUrl}" width="200" />` : ""}
            `}
          />
        ))}
    </>
  );
}
