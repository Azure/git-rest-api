| CI                                                                                                                                                                                                                   | CD                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Build Status](https://dev.azure.com/azure-sdk/public/_apis/build/status/tools/public.git-rest-api.ci?branchName=master)](https://dev.azure.com/azure-sdk/public/_build/latest?definitionId=444&branchName=master) | [![Build Status](https://dev.azure.com/azure-sdk/public/_apis/build/status/tools/Azure.git-rest-api%20Build?branchName=master)](https://dev.azure.com/azure-sdk/public/_build/latest?definitionId=445&branchName=master) |

- Javascript SDK ![https://www.npmjs.com/package/git-rest-api-sdk](https://img.shields.io/npm/v/git-rest-api-sdk.svg)

# Overview

This project is webserver that can be used as a docker container to provide a proxy/rest api on top of git repository.
One of the goal of this is to work around github api rate limiting. The api tries to looks as similar to the github rest api.

Following apis are supported for now:

- Commits
  - List
  - Get
  - Compare
- Branch
  - List
- Files
  - List
  - Get content

# Quick start

```
docker run -d -p 3009:3009 azuredevx/git-rest-api
sleep 3 # optional: wait for container to start
curl localhost:3009/repos/github.com%2Foctocat%2FHello-World/contents/
```

# Deploy with docker

Image: `azuredevx/git-rest-api`

You can configure various options using environemnt variables. See https://github.com/Azure/git-rest-api/blob/master/src/config/schema.ts

**Note: There is no authentication layer yet from your service to the docker image. You should most likely use in in a contained environment(Inside a VNet or kubernetes cluster for example)**

# Use the API

* Using the Javascript sdk
A javascript sdk is always included and up to date with the latest version of the service. 

```
npm install --save git-rest-api-sdk
```

* Use rest api

There is a `/swagger` endpoint which serve the swagger UI with all the api you can use and help you figure out the available/required params.

To authenticate against the repo if its not public you have 2 options:
 - `x-authorization`: This needs to be in a Basic auth format(`Basic base64(usename:password)`). Check with the git server how you can authenticate.
 - `x-github-token`: This is an helper for authnetication against github api. The basic header will be generated automatically 

# Develop

1. Install dependencies

```bash
npm install
```

2. Run

```bash
npm start           # To run once
npm start:watch     # To run and restart when there is a change
```

Run in vscode

Instead of `npm start` run `npm build:watch` and in vscode press `F5`

# Windows

- Long path issue. libgit2(library behind nodegit) doesn't support windows long path feature. Which means some repo with long reference might not work on windows. You can test with other simpler repos on windows. You should however not use this in production on windows.

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
