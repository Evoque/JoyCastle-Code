export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


export const constants = {
    // 并发控制：最多3个
    MAX_CONCURRENCY: 3, // 2.2.1 
    // 超时控制：2.5秒
    TIMEOUT_MS: 2500,   // 2.2.2 
    //重试次数：3次
    MAX_RETRIES: 3,     // 2.2.3 
}

export const config = {
  // 模拟加载配置
  loadConfig: async () => {
    console.log('[Step 1] Loading Config...');
    await new Promise(r => setTimeout(r, 500));
    return ['file0', 'file1', 'file2', 'file3', 'file4'];
  },

  // 模拟加载单个文件 (包含随机延迟和随机失败，用于测试)
  loadFile: async (fileName: string) => {
    const delay = Math.random() * 3000; // 0-3秒随机延迟
    await new Promise((resolve, reject) => setTimeout(() => {
      // 模拟 30% 的概率失败
      if (Math.random() < 0.3) {
        reject(new Error(`Network error loading ${fileName}`));
      } else {
        resolve(`Content of ${fileName}`);
      }
    }, delay));
    return `Data:${fileName}`;
  },
 
};

