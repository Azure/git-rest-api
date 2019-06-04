import { TEST_REPO, e2eClient } from "../../../test/e2e";

describe("Test commits controller", () => {
  it("List commits in the test repo", async () => {
    const response = await e2eClient.fetch(`/repos/${TEST_REPO}/commits`);
    expect(response.status).toEqual(200);
    const content = await response.json();
    expect(content).toMatchPayload("commit_list_master");
  });

  it("returns empty array if asking for page that doesn't exists", async () => {
    const response = await e2eClient.fetch(`/repos/${TEST_REPO}/commits?page=999999`);
    expect(response.status).toEqual(200);
    const content = await response.json();
    expect(content).toEqual([]);
  });
});
