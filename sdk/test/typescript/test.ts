import { GITRestAPI } from "git-rest-api-sdk";
// tslint:disable: no-console

const sdk = new GITRestAPI({ baseUri: "http://localhost:3009" });

async function run() {
  const branches = await sdk.listBranches("github.com/Azure/BatchExplorer");
  console.log("Branches:");

  for (const branch of branches) {
    console.log(`  - ${branch.name}  ${branch.commit.sha}`);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
