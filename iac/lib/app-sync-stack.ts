import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {StackProps} from "aws-cdk-lib";
import {AuthorizationType, GraphqlApi, SchemaFile} from "aws-cdk-lib/aws-appsync";
import * as path from "path";

export interface ApiProps extends StackProps {
    readonly stage: string;
}

export class AppSyncStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiProps) {
        super(scope, id, props);

        new GraphqlApi(this, 'DemoJavascriptResolvers', {
            name: props.stage.concat("-").concat("javascript-resolvers-sample"),
            schema: SchemaFile.fromAsset(path.join(__dirname, './../graphql-schema/schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.API_KEY,
                },
            },
            xrayEnabled: true,
        });
    }
}
