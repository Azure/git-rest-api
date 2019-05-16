import crypto from "crypto";

export const SecureUtils = {
  sha512: (key: string) => {
    const hash = crypto.createHash("sha512");
    hash.update(key);
    return hash.digest("hex");
  },
};
