#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AppSyncStack} from '../lib/app-sync-stack';

const app = new cdk.App();
new AppSyncStack(app, 'AppSyncStack', {
    stage: "dev"
});