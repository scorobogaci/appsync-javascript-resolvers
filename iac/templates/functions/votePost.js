import {util} from '@aws-appsync/utils';

export function request(ctx) {
    const {id, direction} = ctx.arguments;
    const field = direction === 'UP' ? 'ups' : 'downs';

    return {
        operation: 'UpdateItem',
        key: util.dynamodb.toMapValues({id}),
        update: {
            expression: `ADD ${field} :plusOne, version :plusOne`,
            expressionValues: util.dynamodb.toMapValues({':plusOne': 1}),
        },
    };
}

export function response(ctx) {
    return ctx.result;
}