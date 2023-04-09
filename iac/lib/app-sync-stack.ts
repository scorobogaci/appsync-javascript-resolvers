import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {StackProps} from "aws-cdk-lib";
import {
    AppsyncFunction,
    AuthorizationType, Code, FunctionRuntime,
    GraphqlApi, Resolver,
    SchemaFile,
} from "aws-cdk-lib/aws-appsync";
import * as path from "path";
import {AttributeType, Table} from "aws-cdk-lib/aws-dynamodb";

export interface ApiProps extends StackProps {
    readonly stage: string;
}

export class AppSyncStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiProps) {
        super(scope, id, props);

        const appsyncApi = new GraphqlApi(this, 'DemoJavascriptResolvers', {
            name: props.stage.concat("-").concat("javascript-resolvers-sample"),
            schema: SchemaFile.fromAsset(path.join(__dirname, './../graphql-schema/schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.API_KEY,
                },
            }
        });

        const postsTable = new Table(this, 'DemoTable', {
            tableName: props.stage.concat('-posts'),
            deletionProtection: false,
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            }
        });

        postsTable.addGlobalSecondaryIndex({
            indexName: 'author-index',
            partitionKey: {name: 'author', type: AttributeType.STRING},
        })

        const postsDataSource = appsyncApi.addDynamoDbDataSource('PostsDataSource', postsTable);

        const addPostFunction = new AppsyncFunction(this, 'AddPostFunction', {
            name: 'ADD_POST',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/addPost.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const getPostFunction = new AppsyncFunction(this, 'GetPostFunction', {
            name: 'GET_POST',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/getPost.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });


        new Resolver(this, 'AddPostResolver', {
            api: appsyncApi,
            typeName: 'Mutation',
            fieldName: 'addPost',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [addPostFunction],
        });

        new Resolver(this, 'GetPostResolver', {
            api: appsyncApi,
            typeName: 'Query',
            fieldName: 'getPost',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [getPostFunction],
        });

    }
}
