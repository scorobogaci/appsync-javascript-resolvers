import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {
    AppsyncFunction,
    AuthorizationType,
    Code,
    FunctionRuntime,
    GraphqlApi,
    Resolver,
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

        const appsyncApi = new GraphqlApi(this, 'JavascriptResolvers', {
            name: props.stage.concat("-javascript-resolvers-sample"),
            schema: SchemaFile.fromAsset(path.join(__dirname, './../graphql-schema/schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.API_KEY,
                },
            }
        });

        const postsTable = new Table(this, 'PostsTable', {
            tableName: props.stage.concat('-posts'),
            deletionProtection: false,
            removalPolicy: RemovalPolicy.DESTROY,
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

        /* Functions */
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

        const updatePostFunction = new AppsyncFunction(this, 'UpdatePostFunction', {
            name: 'UPDATE_POST',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/updatePost.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const votePostFunction = new AppsyncFunction(this, 'VotePostFunction', {
            name: 'VOTE_POST',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/votePost.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const deletePostFunction = new AppsyncFunction(this, 'DeletePostFunction', {
            name: 'DELETE_POST',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/deletePost.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const getPostsFunction = new AppsyncFunction(this, 'GetPostsFunction', {
            name: 'GET_POSTS',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/getPosts.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const getPostsByAuthor = new AppsyncFunction(this, 'GetPostsByAuthorFunction', {
            name: 'GET_POSTS_BY_AUTHOR',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/getPostsByAuthor.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const getPostsByTag = new AppsyncFunction(this, 'GetPostsByTagFunction', {
            name: 'GET_POSTS_BY_TAG',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/getPostsByTag.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const addTagToPost = new AppsyncFunction(this, 'AddTagToPostFunction', {
            name: 'ADD_TAG',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/addTagToPost.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        const removeTagFromPost = new AppsyncFunction(this, 'RemoveTagFromPostFunction', {
            name: 'REMOVE_TAG',
            api: appsyncApi,
            dataSource: postsDataSource,
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/removeTagFromPost.js')),
            runtime: FunctionRuntime.JS_1_0_0,
        });

        /* Resolvers */
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

        new Resolver(this, 'UpdatePostResolver', {
            api: appsyncApi,
            typeName: 'Mutation',
            fieldName: 'updatePost',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [updatePostFunction],
        });

        new Resolver(this, 'VotePostResolver', {
            api: appsyncApi,
            typeName: 'Mutation',
            fieldName: 'votePost',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [votePostFunction],
        });

        new Resolver(this, 'DeletePostResolver', {
            api: appsyncApi,
            typeName: 'Mutation',
            fieldName: 'deletePost',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [deletePostFunction],
        });

        new Resolver(this, 'GetPostsResolver', {
            api: appsyncApi,
            typeName: 'Query',
            fieldName: 'getPosts',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [getPostsFunction],
        });

        new Resolver(this, 'GetPostsByAuthorResolver', {
            api: appsyncApi,
            typeName: 'Query',
            fieldName: 'getPostsByAuthor',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [getPostsByAuthor],
        });

        new Resolver(this, 'GetPostsByTagResolver', {
            api: appsyncApi,
            typeName: 'Query',
            fieldName: 'getPostsByTag',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [getPostsByTag],
        });

        new Resolver(this, 'AddTagToPostResolver', {
            api: appsyncApi,
            typeName: 'Mutation',
            fieldName: 'addTagToPost',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [addTagToPost],
        });

        new Resolver(this, 'RemoveTagFromPostResolver', {
            api: appsyncApi,
            typeName: 'Mutation',
            fieldName: 'removeTagFromPost',
            code: Code.fromAsset(path.join(__dirname, './../templates/functions/pipeline.js')),
            runtime: FunctionRuntime.JS_1_0_0,
            pipelineConfig: [removeTagFromPost],
        });

    }
}
