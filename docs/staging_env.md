# Staging Environment Setup

⚠️ In progress ⚠️

There are currently two environments to work in, both with associated firebase projects, .env variables, databases, and development platforms(local host).

## Setup Steps

1. Get the `parking-app-staging` evironment variables for `src/firebase/config.ts` to reference from Alec
2. Make a file in the project root called `.env.staging.bak` and put the environment varibales in there
3. Create to files names `.env.production` and `.env.local`. Then in the terminal run `cp .env.staging .env.production` and `cp .env.staging .env.local` to copy over the variables to the production and local development environments

## Switching to the staging env

### 1. Switch 

testing PR