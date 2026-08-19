import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const rootDir = path.resolve(__dirname, "../../");

describe("Nginx & Railway Deployment Configuration", () => {
  const nginxTemplatePath = path.join(rootDir, "nginx.conf.template");
  const dockerfilePath = path.join(rootDir, "Dockerfile");
  const dockerignorePath = path.join(rootDir, ".dockerignore");
  const envProductionPath = path.join(rootDir, ".env.production");

  it("should have nginx.conf.template with required Nginx & proxy settings", () => {
    expect(fs.existsSync(nginxTemplatePath)).toBe(true);
    const content = fs.readFileSync(nginxTemplatePath, "utf-8");

    // Dynamic PORT listening directive
    expect(content).toMatch(/listen\s+(\$\{PORT\}|80);/);

    // SPA client-side routing fallback
    expect(content).toContain("try_files $uri $uri/ /index.html;");

    // Internal API proxy pass directive
    expect(content).toContain("location /api/");
    expect(content).toMatch(/proxy_pass\s+\$\{BACKEND_URL\}\/api\/;/);

    // Required proxy headers
    expect(content).toContain("proxy_http_version 1.1;");
    expect(content).toContain("proxy_set_header Host $host;");
    expect(content).toContain("proxy_set_header X-Real-IP $remote_addr;");
    expect(content).toContain("proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;");
    expect(content).toContain("proxy_set_header X-Forwarded-Proto $scheme;");

    // Gzip & Security headers
    expect(content).toContain("gzip on;");
    expect(content).toContain("X-Frame-Options");
    expect(content).toContain("X-Content-Type-Options");
  });

  it("should have a multi-stage Dockerfile with template support", () => {
    expect(fs.existsSync(dockerfilePath)).toBe(true);
    const content = fs.readFileSync(dockerfilePath, "utf-8");

    // Multi-stage check
    expect(content).toContain("AS builder");
    expect(content).toMatch(/FROM nginx:/);

    // Dynamic env defaults
    expect(content).toContain("ENV PORT=80");
    expect(content).toContain("ENV BACKEND_URL=http://inventory-api.railway.internal:3000");

    // Nginx template copying to official template directory
    expect(content).toContain("/etc/nginx/templates/default.conf.template");
  });

  it("should have .dockerignore excluding node_modules and sensitive files", () => {
    expect(fs.existsSync(dockerignorePath)).toBe(true);
    const content = fs.readFileSync(dockerignorePath, "utf-8");

    expect(content).toContain("node_modules");
    expect(content).toContain(".git");
    expect(content).toContain("dist");
  });

  it("should have .env.production with relative VITE_API_URL", () => {
    expect(fs.existsSync(envProductionPath)).toBe(true);
    const content = fs.readFileSync(envProductionPath, "utf-8");

    expect(content).toMatch(/VITE_API_URL="?\/api"?/);
  });
});
