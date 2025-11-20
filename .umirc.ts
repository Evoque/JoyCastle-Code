import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "TaskManager" },
    { path: "/taskmanager", component: "TaskManager" },
    { path: "/generation", component: "Generation" },
  ],
  npmClient: 'yarn',
});
