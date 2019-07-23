import { TEST_REPO, e2eClient } from "../../../test/e2e";

describe("Test content controller", () => {
  const base = `/repos/${TEST_REPO}/contents`;
  test.each(["", "/", "/README.md", "/dir1", "/dir1?recursive=true", "?recursive=true"])(
    `for path '${base}%s'`,
    async tail => {
      const response = await e2eClient.fetch(`${base}${tail}`);
      expect(response.status).toEqual(200);

      const body = await response.json();
      expect(body).toMatchSnapshot();
    },
  );
});
