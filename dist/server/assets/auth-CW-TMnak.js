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
const CredentialSchema = z.object({
  users: z.array(z.object({
    username: z.string(),
    password: z.string(),
    role: z.string().optional(),
    uuid: z.string().optional(),
    enabled: z.boolean().optional()
  }))
});
function loadCredentials() {
  const filePath = resolve(process.cwd(), "credentials.yml");
  console.log("[auth] Loading credentials from:", filePath);
  const raw = readFileSync(filePath, "utf8");
  const parsed = load(raw);
  console.log("[auth] Raw YAML parsed:", JSON.stringify(parsed));
  const result = CredentialSchema.parse(parsed);
  console.log("[auth] Validated users:", result.users.map((u) => u.username));
  return result;
}
const validateCredentials_createServerFn_handler = createServerRpc({
  id: "8ebbe34d9c3cf8d74d5c419c61649060ec2211be4f88f412177da3ea729967ce",
  name: "validateCredentials",
  filename: "src/server/auth.ts"
}, (opts) => validateCredentials.__executeServer(opts));
const validateCredentials = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  password: z.string()
})).handler(validateCredentials_createServerFn_handler, async ({
  data
}) => {
  console.log("[auth] Attempt — username:", JSON.stringify(data.username), "password:", JSON.stringify(data.password));
  let creds;
  try {
    creds = loadCredentials();
  } catch (err) {
    console.error("[auth] Failed to load credentials.yml:", err);
    return {
      valid: false,
      error: "Auth system unavailable"
    };
  }
  const match = creds.users.find((u) => {
    const usernameMatch = u.username.toLowerCase() === data.username.trim().toLowerCase();
    const passwordMatch = u.password === data.password.trim();
    console.log(`[auth] Checking user "${u.username}": usernameMatch=${usernameMatch}, passwordMatch=${passwordMatch}`);
    return usernameMatch && passwordMatch;
  });
  if (!match) {
    console.log("[auth] No matching credentials found → rejected");
    return {
      valid: false,
      error: "Invalid username or password"
    };
  }
  if (match.enabled === false) {
    console.log("[auth] Account is disabled → rejected");
    return {
      valid: false,
      error: "This account has been disabled. Contact an administrator."
    };
  }
  console.log("[auth] Credentials matched → accepted as", match.username, "/ role:", match.role ?? "user");
  return {
    valid: true,
    username: match.username,
    role: match.role ?? "user"
  };
});
export {
  validateCredentials_createServerFn_handler
};
