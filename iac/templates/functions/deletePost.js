import {util} from '@aws-appsync/utils';

export function request(ctx) {
    const {id, expectedVersion} = ctx.arguments;

    const request = {
        operation: 'DeleteItem',
        key: util.dynamodb.toMapValues({id}),
    };

    if (expectedVersion) {
        request.condition = JSON.parse(
            util.transform.toDynamoDBConditionExpression({
                or: [
                    {id: {attributeExists: false}},
                    {version: {eq: expectedVersion}},
                ],
            })
        );
    }

    return request;
}

export function response(ctx) {
    const {error, result} = ctx;
    if (error) {
        util.appendError(error.message, error.type);
    }
    return result;
}