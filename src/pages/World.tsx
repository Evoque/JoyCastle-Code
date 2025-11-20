import { useState, useEffect, useCallback } from "react";
import { Button, InputNumber, message } from "antd";
import { Globe, Trees, Mountain, Waves, Sun, Sprout } from "lucide-react";

import styles from "./index.less";

interface GridBlock {
  x: number;
  y: number;
  type?: (typeof TERRAIN_TYPES)[keyof typeof TERRAIN_TYPES];
  id?: string;
}

// 定义地形类型、颜色和图标
const TERRAIN_TYPES: any = {
  FOREST: {
    id: "forest",
    label: "森林 (Forest)",
    color: "#4ade80",
    icon: <Trees size={20} color="#064e3b" />,
  },
  DESERT: {
    id: "desert",
    label: "沙漠 (Desert)",
    color: "#fde047",
    icon: <Sun size={20} color="#b45309" />,
  },
  OCEAN: {
    id: "ocean",
    label: "海洋 (Ocean)",
    color: "#60a5fa",
    icon: <Waves size={20} color="#1e3a8a" />,
  },
  MOUNTAIN: {
    id: "mountain",
    label: "山地 (Mountain)",
    color: "#9ca3af",
    icon: <Mountain size={20} color="#374151" />,
  },
  GRASS: {
    id: "grass",
    label: "平原 (Grass)",
    color: "#bef264",
    icon: <Sprout size={20} color="#65a30d" />,
  },
};

const TERRAIN_TYPES_KEYS = Object.keys(TERRAIN_TYPES);

// 简单的网格大小， 默认10*10
const GRID_SIZE = 10;

export default function WorldMapGenerator() {
  const [grid, setGrid] = useState<GridBlock[]>([]);
  const [hoveredBlock, setHoveredBlock] = useState<GridBlock>();
  const [selectedBlock, setSelectedBlock] = useState<GridBlock>({ x: 0, y: 0 }); // 默认选中图中的位置

  // 气候参数状态
  const [moistureSpread, setMoistureSpread] = useState(15); // 湿度传播 (西侧影响)
  const [tempSpread, setTempSpread] = useState(15); // 温度传播 (北侧影响)
  const [stability, setStability] = useState(25); // 气候稳定 (相同加成)

  useEffect(() => {
    generateWorld();
  }, []);

  /** 生成算法
   *  世界种⼦在起始区块 (0,0) 随机⽣成任意⽣物群系
   * 1. 西侧相邻 -> moisture_spread%
   * 2. 北侧相邻 -> temperature_spread%
   * 3. 当西侧和北侧相同时，为"⽓候稳定区"，影响强度为 climate_stability%
   * 4. 基础⽣成概率：⾃然出现率 20%
   * 5. 剩余平均分配
   */
  const generateWorld = useCallback(() => {
    const newGrid = [];

    // 按行遍历
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = [];
      // 按列遍历
      for (let c = 0; c < GRID_SIZE; c++) {
        let weights: Record<string, number> = {};

        // 初始化所权重
        TERRAIN_TYPES_KEYS.forEach((key) => (weights[key] = 0));

        // 1. 邻居
        const westNeighbor = c > 0 ? row[c - 1] : null;
        const northNeighbor = r > 0 ? newGrid[r - 1][c] : null;

        let usedProbability = 0;

        // 2. 计算气候传播影响
        if (r === 0 && c === 0) {
          // (0,0) 起始点
          usedProbability = 0;
        } else {
          // 西侧和北侧生物群系相同
          if (
            westNeighbor &&
            northNeighbor &&
            westNeighbor.type === northNeighbor.type
          ) {
            const stableType = westNeighbor.type;
            weights[stableType] += stability;
            usedProbability += stability;
          } else {
            // 分别计算西侧和北侧的影响
            if (westNeighbor) {
              weights[westNeighbor.type] += moistureSpread;
              usedProbability += moistureSpread;
            }
            if (northNeighbor) {
              weights[northNeighbor.type] += tempSpread;
              usedProbability += tempSpread;
            }
          }
        }

        // 3. 分配剩余概率 (平均分配给所有类型，作为基础生成率)
        // 这里的逻辑实现：将 (100 - 已用概率) 平均分给5种群系
        const remainingProb = Math.max(0, 100 - usedProbability);
        const baseProbPerBiome = remainingProb / TERRAIN_TYPES_KEYS.length;

        TERRAIN_TYPES_KEYS.forEach((key) => {
          weights[key] += baseProbPerBiome;
        });

        // 4. 轮盘赌选择生物群系
        const randomVal = Math.random() * 100;
        let accumulated = 0;
        let selectedType = TERRAIN_TYPES_KEYS[TERRAIN_TYPES_KEYS.length - 1];

        for (const key of TERRAIN_TYPES_KEYS) {
          accumulated += weights[key];
          if (randomVal <= accumulated) {
            selectedType = key;
            break;
          }
        }

        // 将区块推入当前行
        row.push({
          x: r,
          y: c,
          type: selectedType,
          data: TERRAIN_TYPES[selectedType],
        });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
  }, [moistureSpread, tempSpread, stability]);

  const handleMouseEnter = (block?: GridBlock) => {
    setHoveredBlock(block);
  };

  const handleClick = (block?: GridBlock) => {
    if (block) setSelectedBlock({ x: block.x, y: block.y });
  };

  const currentBlock =
    hoveredBlock ||
    grid.find((b) => b.x === selectedBlock.x && b.y === selectedBlock.y);
  const infoText = currentBlock
    ? `区块 (${currentBlock.x},${currentBlock.y}): ${
        currentBlock.type || "未知"
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
              value={moistureSpread}
              formatter={(value) => `${value}%`}
              parser={(value) => Number(value?.replace("%", "")) || 0}
              onChange={(v?: number) => setMoistureSpread(v || 0)}
            />
          </div>

          <div>
            <span className={styles.wLabel}>温度传播:</span>
            <InputNumber
              min={0}
              max={100}
              size="small"
              style={{ width: 70 }}
              value={tempSpread}
              formatter={(value) => `${value}%`}
              parser={(value) => Number(value?.replace("%", "")) || 0}
              onChange={(v?: number) => setTempSpread(v || 0)}
            />
          </div>
          <div>
            <span className={styles.wLabel}>气候稳定:</span>
            <InputNumber
              min={0}
              max={100}
              size="small"
              style={{ width: 70 }}
              value={stability}
              formatter={(value) => `${value}%`}
              onChange={(v?: number) => setStability(v || 0)}
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
        {grid.map((row, rIndex) =>
          row.map((block, cIndex) => {
            return (
              <div
                key={`${rIndex}-${cIndex}`}
                style={{ backgroundColor: TERRAIN_TYPES[block.type]?.color }}
                onMouseEnter={() => handleMouseEnter(block)}
                onClick={() => handleClick(block)}
                className={styles.wTile}
                title={`(${rIndex},${cIndex}) ${block.data.name}`}
              >
                <span className="drop-shadow-md filter">{block.data.icon}</span>
              </div>
            );
          })
        )}
      </div>

      {/* 底部图例 */}
      <div className={styles.wFooterLegend}>
        {Object.values(TERRAIN_TYPES).map((type) => (
          <div key={type.id} className={styles.wLegendItem}>
            <div
              className={styles.wColorBox}
              style={{ backgroundColor: type.color }}
            />
            <span className={styles.wLegendItemContent}>
              {type.icon}
              {type.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
