# google-container-github

Github integration for Google Cloud Container Builder, using Google Cloud Functions to update Github commit status when a build reaches a specific state.

## Setup
- Create a Github access token [here](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line).
- Set the `PROJECT_ID` variable:
```
export PROJECT_ID=my-project-id
```
- [Optionally] Set a specific `BUCKET_NAME`, `FUNCTION_NAME` and `REGION`.

- Create the function:
```
npm run setup
```

## Teardown
The teardown script will delete the function `FUNCTION_NAME`, and the bucket `BUCKET_NAME`.
```
npm run teardown
```

## FAQ

### How much does it cost?
Each build invokes the function 3 times:
- when the build is queued
- when the build starts
- when the build reaches a final status.

Here is the [GCF pricing](https://cloud.google.com/functions/pricing) for calculation.
### Can I use an existing bucket?
Yes, specify the `BUCKET_NAME`:
```
exports BUCKET_NAME=my-bucket
```
### How can I update a function?
If you use the setup script with the same `FUNCTION_NAME`, it will update the existing function.
