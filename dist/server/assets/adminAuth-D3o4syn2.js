import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { load } from "js-yaml";
import { z } from "zod";
import { c as createServerFn } from "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const AdminSchema = z.object({
  admin: z.object({
    username: z.string(),
    password1: z.string(),
    password2: z.string()
  })
});
function loadAdminCredentials() {
  const filePath = resolve(process.cwd(), "admin.yml");
  const raw = readFileSync(filePath, "utf8");
  const parsed = load(raw);
  return AdminSchema.parse(parsed);
}
const validateAdminCredentials_createServerFn_handler = createServerRpc({
  id: "1cd5592b008228410e370e8fdc87f51b9cbd66cb105cb8bbc964ab8ddb0ce73d",
  name: "validateAdminCredentials",
  filename: "src/server/adminAuth.ts"
}, (opts) => validateAdminCredentials.__executeServer(opts));
const validateAdminCredentials = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  password1: z.string(),
  password2: z.string()
})).handler(validateAdminCredentials_createServerFn_handler, async ({
  data
}) => {
  let cfg;
  try {
    cfg = loadAdminCredentials();
  } catch (err) {
    console.error("[adminAuth] Failed to load admin.yml:", err);
    return {
      valid: false,
      error: "Admin auth unavailable"
    };
  }
  const {
    admin
  } = cfg;
  const usernameMatch = admin.username === data.username.trim();
  const password1Match = admin.password1 === data.password1;
  const password2Match = admin.password2 === data.password2;
  if (!usernameMatch || !password1Match || !password2Match) {
    return {
      valid: false,
      error: "Invalid credentials"
    };
  }
  return {
    valid: true,
    username: admin.username
  };
});
export {
  validateAdminCredentials_createServerFn_handler
};
