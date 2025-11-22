import React from "react";
import PropTypes from "prop-types";

const PathUI = ({ places }) => {
  const originalPoints = [
    { x: 50, y: 50 },
    { x: 200, y: 50 },
    { x: 350, y: 50 },
    { x: 350, y: 125 },
    { x: 200, y: 125 },
    { x: 50, y: 125 },
    { x: 50, y: 200 },
    { x: 200, y: 200 },
    { x: 350, y: 200 },
    { x: 350, y: 275 },
    { x: 200, y: 275 },
    { x: 50, y: 275 },
    { x: 50, y: 350 },
    { x: 200, y: 350 },
    { x: 350, y: 350 },
    { x: 350, y: 425 },
    { x: 200, y: 425 },
    { x: 50, y: 425 },
    { x: 50, y: 500 },
    { x: 200, y: 500 },
    { x: 350, y: 500 },
    { x: 350, y: 575 },
    { x: 200, y: 575 },
    { x: 50, y: 575 },
    { x: 50, y: 650 },
    { x: 200, y: 650 },
    { x: 350, y: 650 },
    { x: 350, y: 725 },
    { x: 200, y: 725 },
    { x: 50, y: 725 },
    { x: 50, y: 800 },
    { x: 200, y: 800 },
    { x: 350, y: 800 },
    { x: 350, y: 875 },
    { x: 200, y: 875 },
    { x: 50, y: 875 },
  ];

  const points = originalPoints.slice(0, places.length);

  // Calculate the maximum y-coordinate
  const maxY = Math.max(...points.map((p) => p.y));

  // Add some padding to the bottom
  const viewBoxHeight = maxY + 50;

  return (
    <div
      className="bg-gray-100 p-4 rounded-lg shadow-inner"
      style={{ aspectRatio: `400 / ${viewBoxHeight}` }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 400 ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="bg-white rounded-lg"
      >
        <path
          d={`M ${points[0].x} ${points[0].y} ${points
            .slice(1)
            .map((p) => `L ${p.x} ${p.y}`)
            .join(" ")}`}
          fill="none"
          stroke="red"
          strokeWidth="2"
        />
        {points.map((point, index) => (
          <React.Fragment key={index}>
            <circle cx={point.x} cy={point.y} r="6" fill="red" />
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              fontSize="12"
              fill="black"
              className="bg-gray-200 px-1 rounded"
            >
              {places[index].name}
            </text>
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
};

PathUI.propTypes = {
  places: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PathUI;
