import { initServer } from "./server";

const init = async () => {
  await initServer("0.0.0.0", 3200);
};
init();
