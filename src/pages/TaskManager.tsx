import { useState } from "react";
import { Button, Progress } from "antd";
import { PlayCircleTwoTone } from "@ant-design/icons";
import { sleep, constants, config } from "@/utils/index";

import styles from "./index.less";

export default function HomePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [rate, setRate] = useState<number>(0);

  async function onStartBtnClick() {
    try {
      setLogs(["******** Process Started ********"]);

      const fileList = await config.loadConfig();
      setLogs((prev) => [...prev, `FileList: ${fileList}`]);

      await loadFilesConcurrency(fileList);
 
      await initSystem();

    } catch (error) {
      setLogs((prev) => [...prev, `Critical Error: ${error}`]);
    }
  }

  /**
   * 加载文件, 考虑
   *  1.并发；
   *  2.超时；
   *  3.重试.
   */
  async function loadFilesConcurrency(fileList: string[]) {
    const executing: Promise<any>[] = [];
    const results = [];

    for (const fileName of fileList) {
      const p = processFile(fileName).then((res) => { 
        executing.splice(executing.indexOf(p), 1);
         setRate((prev) => prev + 100 / fileList.length);
        return res;
      });

      executing.push(p);
      results.push(p);

      if (executing.length >= constants.MAX_CONCURRENCY) {
        await Promise.race(executing);
      }
    }

    return Promise.all(results);
  }

  async function processFile(fileName: string) {
    let attempt = 0;

    while (attempt <= constants.MAX_RETRIES) {
      try {
        setLogs((prev) => [...prev, `Start loading: ${fileName} (${attempt + 1})`]);

        const result = await loadTimeout(fileName);

        setLogs((prev) => [...prev, `Loaded: ${fileName}`]);
        return result;
      } catch (error: any) {
        // 重试逻辑
        attempt++;
        setLogs((prev) => [...prev, `Error loading ${fileName}: ${error.message}`]);

        if (attempt > constants.MAX_RETRIES) { 
          setLogs((prev) => [...prev, `Load fail ${fileName} after ${constants.MAX_RETRIES} times.`]);
          throw error;
        }

        // Backoff Retry-指数退避, 假设: 100ms, 200ms, 400ms...
        const backoffTime = 100 * Math.pow(2, attempt - 1);
        setLogs((prev) => [...prev, `Waiting ${backoffTime}ms before ${fileName}...`]);
        await sleep(backoffTime);
      }
    }
  }

  function loadTimeout(fileName: string) {
    return new Promise((resolve, reject) => {
      // 设定超时计时器
      const timer = setTimeout(() => {
        reject(new Error(`超时了!(${constants.TIMEOUT_MS}ms)`));
        setLogs((prev) => [...prev, `Timeout: ${fileName} (${constants.TIMEOUT_MS}ms)`]);
      }, constants.TIMEOUT_MS);

      config
        .loadFile(fileName)
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  async function initSystem() {
    setLogs((prev) => [...prev, "[Step 3] Initializing System..."]);
    await new Promise((r) => setTimeout(r, 500));
    setLogs((prev) => [...prev, "******** DONE! ********"]);
  }

  return (
    <div>
      {/* 开始按钮 */}
      <Button
        type="primary"
        shape="round"
        icon={<PlayCircleTwoTone />}
        size="large"
        onClick={onStartBtnClick}
      >
        开始任务
      </Button>
      {/* 进度条及进度信息 */}
      <Progress
        className={styles.progress}
        strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
        percent={rate}
      />

      {/* 控制台Log区 */}
      <div className={styles["log-container"]}>
        <pre className={styles["log-content"]} id="logContent">
          {logs.join("\n")}
        </pre>
      </div>
    </div>
  );
}
