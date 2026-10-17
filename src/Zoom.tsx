import React, { useState } from "react";
interface Props {
  handleZoomIn: (e: React.MouseEvent) => void;
  handleZoomOut: (e: React.MouseEvent) => void;
  handleResetZoom: (e: React.MouseEvent) => void;
}

export default function Zoom({
  handleZoomIn,
  handleZoomOut,
  handleResetZoom,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <button type="button" onClick={handleZoomIn}>
        +
      </button>
      <button type="button" onClick={handleZoomOut}>
        -
      </button>
      <button type="button" onClick={handleResetZoom}>
        &#128100;
      </button>
    </div>
  );
}
