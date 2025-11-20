import { useState, useEffect } from "react";
import { Button, InputNumber, message } from "antd";
import { Globe, Trees, Mountain, Waves, Sun, Sprout } from "lucide-react";
import styles from './index.less';


interface GridBlock {
  x: number;
  y: number;
  type?: (typeof TERRAIN_TYPES)[keyof typeof TERRAIN_TYPES];
  id?: string;
}
 
// 定义地形类型、颜色和图标
const TERRAIN_TYPES = {
  FOREST: { id: "forest", label: "森林 (Forest)", color: "#4ade80", icon: <Trees size={20} color="#064e3b" /> },
  DESERT: { id: "desert", label: "沙漠 (Desert)", color: "#fde047", icon: <Sun size={20} color="#b45309" /> }, 
  OCEAN: { id: "ocean", label: "海洋 (Ocean)", color: "#60a5fa", icon: <Waves size={20} color="#1e3a8a" /> },
  MOUNTAIN: { id: "mountain", label: "山地 (Mountain)", color: "#9ca3af", icon: <Mountain size={20} color="#374151" /> },
  GRASS: { id: "grass", label: "平原 (Grass)", color: "#bef264", icon: <Sprout size={20} color="#65a30d" /> },
};

// 简单的网格大小， 默认10*10
const GRID_SIZE = 10;

export default function WorldMapGenerator() { 
  const [grid, setGrid] = useState<GridBlock[]>([]);
  const [params, setParams] = useState({ humidity: 15, temperature: 15, stability: 25 });
  const [hoveredBlock, setHoveredBlock] = useState<GridBlock>();
  const [selectedBlock, setSelectedBlock] = useState<GridBlock>({ x: 4, y: 4 }); // 默认选中图中的位置
  
  useEffect(() => {
    generateWorld();
  }, []);

  /** 生成随机世界地图数据 */
  const generateWorld = () => {
    const newGrid = [];
    const types = Object.values(TERRAIN_TYPES);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) { 
        const randomType = types[Math.floor(Math.random() * types.length)];
        newGrid.push({ x, y, type: randomType, id: `${x}-${y}` });
      }
    }
    setGrid(newGrid);
    message.success("新世界已生成！");
  }; 

  
  const handleMouseEnter = (block?: GridBlock) => {
    setHoveredBlock(block);
  };
 
  const handleClick = (block?: GridBlock) => {
    if (block) setSelectedBlock({ x: block.x, y: block.y });
  };

  // 获取当前显示的信息 (优先显示 hover，没有则显示选中)
  const currentBlock =
    hoveredBlock ||
    grid.find((b) => b.x === selectedBlock.x && b.y === selectedBlock.y);
  const infoText = currentBlock
    ? `区块 (${currentBlock.x},${currentBlock.y}): ${
        currentBlock.type?.label.split(" ")[0] || "未知"
      }`
    : "请选择区块";

  return (
    <div className={styles.wContainer}>
      <div className={styles.wHeaderBar}>
        <div className={styles.wInfoTag}>{infoText}</div>

        <div className={styles.wControlGroup}>
          <div>
            <span className={styles.wLabel}>湿度传播:</span>
            <InputNumber
              min={0}
              max={100}
              size="small"
              style={{ width: 70 }}
              value={params.humidity}
              formatter={(value) => `${value}%`}
              parser={(value) => Number(value?.replace("%", "")) || 0}
              onChange={(v?: number) =>
                setParams({ ...params, humidity: v || 0 })
              }
            />
          </div>

          <div>
            <span className={styles.wLabel}>温度传播:</span>
            <InputNumber
              min={0}
              max={100}
              size="small"
              style={{ width: 70 }}
              value={params.temperature}
              formatter={(value) => `${value}%`}
              parser={(value) => Number(value?.replace("%", "")) || 0}
              onChange={(v?: number) =>
                setParams({ ...params, temperature: v || 0 })
              }
            />
          </div>
          <div>
            <span className={styles.wLabel}>气候稳定:</span>
            <InputNumber
              min={0}
              max={100}
              size="small"
              style={{ width: 70 }}
              value={params.stability}
              formatter={(value) => `${value}%`}
              onChange={(v?: number) =>
                setParams({ ...params, stability: v || 0 })
              }
            />
          </div>
        </div>

        <Button
          type="primary"
          icon={<Globe size={16} />}
          onClick={generateWorld}
          size="large"
          style={{
            fontWeight: "bold",
            backgroundColor: "#15803d",
            borderColor: "#15803d",
          }}
        >
          生成新世界
        </Button>
      </div>

      <div
        className={styles.wGridContainer}
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        onMouseLeave={() => setHoveredBlock(undefined)}
      >
        {grid.map((block) => {
          const isSelected =
            selectedBlock.x === block.x && selectedBlock.y === block.y;
          return (
            <div
              key={block.id}
              className={styles.wTile}
              style={{
                backgroundColor: block.type?.color,
              }}
              onMouseEnter={() => handleMouseEnter(block)}
              onClick={() => handleClick(block)}
            >
              <div style={{ opacity: 0.7 }}>{block.type?.icon}</div>
              {isSelected && <div className={styles.wSelectionBorder} />}
            </div>
          );
        })}
      </div>

      {/* 底部图例 */}
      <div className={styles.wFooterLegend}>
        {Object.values(TERRAIN_TYPES).map((type) => (
          <div key={type.id} className={styles.wLegendItem}>
            <div className={styles.wColorBox} style={{ backgroundColor: type.color }} />
            <span className={styles.wLegendItemContent} >
              {type.icon}{type.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
