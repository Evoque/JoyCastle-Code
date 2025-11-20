import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "TaskManager" },
    { path: "/taskmanager", component: "TaskManager" },
    { path: "/world", component: "World" },
  ],
  npmClient: 'yarn',
});
