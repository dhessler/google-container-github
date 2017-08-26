const github = require('octonode');
const util = require('util');

const config = require('./config.json');
const client = github.client(config.GITHUB_TOKEN);

// pending, success, error, or failure
const toGithubStatus = (gcbStatus) => {
  if (gcbStatus === 'SUCCESS') {
    return "success";
  }
  else if (gcbStatus === 'FAILURE') {
    return "error";
  }
  else if (gcbStatus === 'INTERNAL_ERROR' || gcbStatus === 'TIMEOUT') {
    return "failure";
  }
  return "pending";
}

// subscribe is the main function called by GCF.
const subscribe = (event, callback) => {
  const build = eventToBuild(event.data.data);

  console.log(`Build info: ${util.inspect(build)}`);

  const { projectId, repoName, commitSha } = build.sourceProvenance.resolvedRepoSource;
  const org = projectId;
  let repo = repoName;

  // GCB repoName is incorrect, try to fix by removing added prefix
  const gcbPrefix = `github-${projectId}-`;
  if (repoName.indexOf(gcbPrefix) === 0) {
    // trim gcb generated prefix
    repo = repo.slice(gcbPrefix.length);
  }

  const ghrepo = client.repo(`${org}/${repo}`);

  // Update github commit status.
  ghrepo.status(commitSha, {
    state: toGithubStatus(build.status),
    target_url: build.logUrl,
    description: `Build ${build.status.toLowerCase().replace(/_/g, ' ')}.`
  }, callback);
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
  return JSON.parse(new Buffer(data, 'base64').toString());
}

module.exports = {
  subscribe: subscribe
}
