import client from "./client";

export const getSettings = () =>
  client.get("/settings").then((res) => res.data);

export const updateSettings = (settings) =>
  client.post("/settings", settings).then((res) => res.data);
