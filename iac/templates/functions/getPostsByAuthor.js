import {util} from '@aws-appsync/utils';

export function request(ctx) {
    const {limit = 20, nextToken, author} = ctx.arguments;
    const index = 'author-index';
    const query = JSON.parse(
        util.transform.toDynamoDBConditionExpression({author: {eq: author}})
    );
    return {operation: 'Query', index, query, limit, nextToken};
}

export function response(ctx) {
    const {items: posts = [], nextToken} = ctx.result;
    return {posts, nextToken};
}