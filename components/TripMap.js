import React, { useEffect, useRef, useState } from "react";

const TripMap = ({ places }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const pathLineRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_APP_KEY}&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(35.2538433, 128.6402609),
          level: 3,
        };
        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);
        setLoading(false);
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const createCustomOverlay = (position, content) => {
    return new window.kakao.maps.CustomOverlay({
      position: position,
      content: `
        <div class="custom-overlay bg-white px-2 py-1 rounded-lg shadow-md text-sm text-darkslategray font-semibold">
          ${content}
        </div>
      `,
      yAnchor: 1.5,
    });
  };

  useEffect(() => {
    if (!map || places.length === 0) return;

    // Clear existing markers and path
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (pathLineRef.current) {
      pathLineRef.current.setMap(null);
    }

    const bounds = new window.kakao.maps.LatLngBounds();

    places.forEach((place, index) => {
      if (place.name) {
        const position = new window.kakao.maps.LatLng(place.y, place.x);
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map,
        });

        const customOverlay = createCustomOverlay(
          position,
          `${index + 1}. ${place.name}`
        );
        customOverlay.setMap(map);

        markersRef.current.push(marker);
        bounds.extend(position);
      }
    });

    // Reset map range
    if (!bounds.isEmpty()) {
      map.setBounds(bounds);
    }

    // Calculate and display route
    if (places.length > 1) {
      calculateRoute(places);
    }
  }, [map, places]);

  const calculateRoute = async (places) => {
    const origin = places[0];
    const destination = places[places.length - 1];
    const waypoints = places.slice(1, -1);

    const requestBody = {
      origin: {
        x: origin.x,
        y: origin.y,
      },
      destination: {
        x: destination.x,
        y: destination.y,
      },
      waypoints: waypoints.map((place) => ({
        x: place.x,
        y: place.y,
      })),
      priority: "DISTANCE",
      avoid: ["ferries", "uturn"],
    };

    try {
      const response = await fetch("/api/kakao/directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          "네트워크 응답이 올바르지 않습니다: " + response.status
        );
      }

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        displayRoute(data.routes[0]);
      }
    } catch (error) {
      console.error("오류 발생:", error);
    }
  };

  const displayRoute = (route) => {
    const linePath = [];
    if (route.sections && route.sections.length > 0) {
      route.sections.forEach((section) => {
        if (section.roads) {
          section.roads.forEach((road) => {
            if (road.vertexes) {
              for (let i = 0; i < road.vertexes.length; i += 2) {
                linePath.push(
                  new window.kakao.maps.LatLng(
                    road.vertexes[i + 1],
                    road.vertexes[i]
                  )
                );
              }
            }
          });
        }
      });
    }

    if (!linePath.length) {
      return;
    }

    const pathLine = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: "#FF3C26",
      strokeOpacity: 0.7,
      strokeStyle: "solid",
    });
    pathLine.setMap(map);

    // 기존 경로선이 있다면 제거
    if (pathLineRef.current) {
      pathLineRef.current.setMap(null);
    }
    pathLineRef.current = pathLine;

    // 경로가 모두 보이도록 지도 범위 재설정
    const bounds = new window.kakao.maps.LatLngBounds();
    linePath.forEach((point) => {
      bounds.extend(point);
    });
    map.setBounds(bounds);
  };

  return (
    <div className="map-container mb-4 relative z-0 rounded-lg overflow-hidden shadow-md bg-gray-100">
      <div
        ref={mapRef}
        style={{ width: "100%", height: "300px" }}
        className="rounded-lg"
      />
      {loading && (
        <div className="loading-overlay absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orangered mb-2"></div>
            <p className="text-sm text-gray-600">지도 로드 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMap;
