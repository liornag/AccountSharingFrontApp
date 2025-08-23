import { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Circle, Line } from "react-konva";
import useImage from "use-image";
import { Button } from "antd";

export default function ReceiptCropper({ fileUrl, points, setPoints }) {
  const [image] = useImage(fileUrl);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // initialize 4 corner points once image loads

  useEffect(() => {
    if (image) {
      setImageSize({ width: image.width, height: image.height });

      // set default points closer to image corners
      setPoints([
        { x: 20, y: 20 },
        { x: image.width - 20, y: 20 },
        { x: image.width - 20, y: image.height - 20 },
        { x: 20, y: image.height - 20 },
      ]);
    }
  }, [image, fileUrl, setPoints]);

  const handleDragMove = (index, e) => {
    const newPoints = [...points];
    newPoints[index] = { x: e.target.x(), y: e.target.y() };
    setPoints(newPoints);
  };

  // normalize to original image size before sending
  const handleConfirm = () => {
    const originalWidth = image?.width || imageSize.width;
    const originalHeight = image?.height || imageSize.height;

    const displayedWidth = imageSize.width;
    const displayedHeight = imageSize.height;

    const scaleX = originalWidth / displayedWidth;
    const scaleY = originalHeight / displayedHeight;

    const normalized = points.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    onConfirm(normalized);
  };

  if (!image) return <p>Loading image...</p>;

  return (
    <div>
      <Stage width={imageSize.width} height={imageSize.height}>
        <Layer>
          <KonvaImage image={image} width={imageSize.width} height={imageSize.height}/>
          {/* polygon connecting points */}
          <Line
            points={points.flatMap((p) => [p.x, p.y])}
            closed
            stroke="red"
            strokeWidth={2}
          />
          {/* draggable circles */}
          {points.map((p, i) => (
            <Circle
              key={i}
              x={p.x}
              y={p.y}
              radius={12} // big enough for fingers
              fill="blue"
              draggable
              onDragMove={(e) => handleDragMove(i, e)}
            />
          ))}
        </Layer>
      </Stage>

      <Button
        
        style={{ marginTop: 16 , marginRight: 5}}
        onClick={handleConfirm}
      >
        Confirm Selection
      </Button>
      <Button
        onClick={() =>
          setPoints([
            { x: 50, y: 50 },
            { x: 250, y: 50 },
            { x: 250, y: 200 },
            { x: 50, y: 200 },
          ])
        }
      >
        Reset
      </Button>
    </div>
  );
}
