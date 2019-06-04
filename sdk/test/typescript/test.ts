import { GITRestAPI, GitBranch } from "git-rest-api-sdk";
// tslint:disable: no-console

const sdk = new GITRestAPI({ baseUri: "http://localhost:3009" });

async function run() {
  const branches: GitBranch[] = await sdk.branches.list("github.com/Azure/BatchExplorer");
  console.log("Branches:");

  for (const branch of branches) {
    console.log(`  - ${branch.name}  ${branch.commit.sha}`);
  }

  const response = await sdk.commits.list("github.com/Azure/BatchExplorer");
  console.log("Total commits", response.xTotalCount);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
