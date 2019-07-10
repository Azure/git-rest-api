import { TEST_REPO, UNENCODED_TEST_REPO, deleteLocalRepo, e2eClient } from "../../../test/e2e";
import { delay } from "../../utils";

describe("Test branch controller", () => {
  it("doesn't conflict when getting the same repo twice at the same time", async () => {
    await delay(2000); // Need to wait for the server to release locks on the repo from previous tests. As e2e test are run in squence this should be a fixed amount of time
    await deleteLocalRepo(UNENCODED_TEST_REPO);
    await delay(100);
    const responses = await Promise.all([
      e2eClient.fetch(`/repos/${TEST_REPO}/branches`),
      // Delay a little to start the clone
      delay(10).then(() => e2eClient.fetch(`/repos/${TEST_REPO}/branches`)),
      delay(20).then(() => e2eClient.fetch(`/repos/${TEST_REPO}/branches`)),
      delay(30).then(() => e2eClient.fetch(`/repos/${TEST_REPO}/branches`)),
      delay(40).then(() => e2eClient.fetch(`/repos/${TEST_REPO}/branches`)),
      delay(50).then(() => e2eClient.fetch(`/repos/${TEST_REPO}/branches`)),
    ]);

    for (const response of responses) {
      expect(response.status).toEqual(200);
    }

    const [first, ...others] = await Promise.all(responses.map(x => x.json() as Promise<any[]>));
    for (const content of others) {
      expect(sortBy(content, x => x.name)).toEqual(sortBy(first, x => x.name));
    }

    // Make sure the server didn't crash. This is a regression test where a segfault happened freeing the Repository object.
    await delay(1000);
    const lastResponse = await e2eClient.fetch(`/repos/${TEST_REPO}/branches`);

    expect(lastResponse.status).toEqual(200);
  });

  it("List branches in the test repo", async () => {
    const response = await e2eClient.fetch(`/repos/${TEST_REPO}/branches`);
    expect(response.status).toEqual(200);
    const content: any[] = await response.json();
    expect(sortBy(content, x => x.name)).toMatchPayload("branches_list");
  });
});

function sortBy<T>(array: T[], attr: (item: T) => any): T[] {
  return array.sort((a, b) => {
    const aAttr = attr(a);
    const bAttr = attr(b);

    if (aAttr < bAttr) {
      return -1;
    } else if (aAttr > bAttr) {
      return 1;
    } else {
      return 0;
    }
  });
}
