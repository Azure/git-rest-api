import { TEST_REPO, e2eClient } from "../../../test/e2e";

describe("Test branch controller", () => {
  it("List branches in the test repo", async () => {
    const response = await e2eClient.fetch(`/repos/${TEST_REPO}/branches`);
    expect(response.status).toEqual(200);
    const content = await response.json();
    expect(content).toMatchPayload("branches_list");
  });
});
