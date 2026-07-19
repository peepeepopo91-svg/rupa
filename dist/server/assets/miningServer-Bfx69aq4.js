import { c as createSsrRpc } from "./router-BSxSKO2b.js";
import { z } from "zod";
import { c as createServerFn } from "../server.js";
createServerFn({
  method: "GET"
}).handler(createSsrRpc("9c403a0b1baaa9eb01522526a02467b0bbe7366ce94755351c706515263f9ab1"));
const serverCatchUp = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  seedUser: z.any().optional()
})).handler(createSsrRpc("ccdb6274a919b4e64faac8870a35fdd9f2379e43902fbc073e763702f8e0edb1"));
const saveMiningUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  user: z.any()
})).handler(createSsrRpc("8de7a5ffa64cbe7de66496bd09cd405c8c5bbd016fc0db22792f19363f0ae2c2"));
const getAllMiningUsers = createServerFn({
  method: "GET"
}).handler(createSsrRpc("450e0a26a740dcd825927e9bc6d268f76e8a10fd98c7ba9b681fe818d0b5015b"));
const adminUpdateMiningUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  user: z.any()
})).handler(createSsrRpc("8e3d970b0a3780ca5ee670f87b0ba84cb45748760c3b1b1be58131158580b660"));
const getLeaderboard = createServerFn({
  method: "GET"
}).handler(createSsrRpc("7fa8b3cbd5fc8f402a586f9817e3556e666bae0870bfdf16a35ee35117771bb1"));
createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string()
})).handler(createSsrRpc("2a08d77084734e5724f0b7c889d954a908a3bb05d5c0b96eecc2c94776f3daa7"));
export {
  serverCatchUp as a,
  getAllMiningUsers as b,
  adminUpdateMiningUser as c,
  getLeaderboard as g,
  saveMiningUser as s
};
