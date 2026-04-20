import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeControlPanel } from "./controlPanelNormalizer.js";

export class GitHubFileControlPanelClient {
  constructor({ controlPanelPath, cwd = process.cwd() }) {
    this.controlPanelPath = controlPanelPath;
    this.cwd = cwd;
  }

  async readControlPanel() {
    const absolutePath = path.isAbsolute(this.controlPanelPath)
      ? this.controlPanelPath
      : path.resolve(this.cwd, this.controlPanelPath);
    const raw = await readFile(absolutePath, "utf8");
    return normalizeControlPanel(JSON.parse(raw));
  }
}
