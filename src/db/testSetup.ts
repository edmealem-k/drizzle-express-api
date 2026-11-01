import { db } from "./index";
import { users } from "./schema";

export const resetDb = async () => {
  await db.delete(users);
};
