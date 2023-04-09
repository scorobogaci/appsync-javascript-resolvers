import { util } from '@aws-appsync/utils';

export function request(ctx) {
    const { id, tag } = ctx.arguments;
    const expressionValues = util.dynamodb.toMapValues({ ':plusOne': 1 });
    expressionValues[':tags'] = util.dynamodb.toStringSet([tag]);

    return {
        operation: 'UpdateItem',
        key: util.dynamodb.toMapValues({ id }),
        update: {
            expression: `DELETE tags :tags ADD version :plusOne`,
            expressionValues,
        },
    };
}

export function response(ctx) {
    return ctx.result;
}