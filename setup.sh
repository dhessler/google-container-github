#!/usr/bin/env bash

[ -z "$PROJECT_ID" ] && echo "Need to set PROJECT_ID" && exit 1;
[ -z "$GITHUB_ACCESS_TOKEN" ] && echo "Need to set GITHUB_ACCESS_TOKEN" && exit 1;

gcloud config set project $PROJECT_ID

cat <<EOF > config.json
{
  "GITHUB_ACCESS_TOKEN": "$GITHUB_ACCESS_TOKEN"
}
EOF

# Create bucket name if not set.
if [ -z "$BUCKET_NAME" ]; then
  # Create pseudo random bucket name, otherwise an attacker
  # could use the pattern to create a bucket and get the
  # function code.
  md5=md5 && [[ -n "$(which md5)" ]] || md5=md5sum
  export BUCKET_NAME="$PROJECT_ID-gcf-$(date | $md5 | cut -c -10)"
fi

# Create bucket.
gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME

# Use default function name if not set.
if [ -z "$FUNCTION_NAME" ]; then
  export FUNCTION_NAME="containerGithubIntegration"
fi

# Use default region if not set.
if [ -z "$REGION" ]; then
  export REGION="us-central1"
fi

# Deploy function.
gcloud beta functions deploy $FUNCTION_NAME --stage-bucket $BUCKET_NAME --trigger-topic cloud-builds --entry-point subscribe --region $REGION
