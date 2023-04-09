import {util} from '@aws-appsync/utils';

export function request(ctx) {
    const {id, expectedVersion, ...values} = ctx.args;
    const condition = {version: {eq: expectedVersion}};
    return dynamodbUpdateRequest({key: {id}, values, condition});
}

export function response(ctx) {
    const {error, result} = ctx;
    if (error) {
        util.appendError(error.message, error.type);
    }
    return result;
}

function dynamodbUpdateRequest({key, values, condition}) {
    const sets = [];
    const removes = [];
    const expressionNames = {};
    const expValues = {};

    for (const [k, value] of Object.entries(values)) {
        expressionNames[`#${k}`] = k;
        if (value && value.length) {
            sets.push(`#${k} = :${k}`);
            expValues[`:${k}`] = value;
        } else {
            removes.push(`#${k}`);
        }
    }

    let expression = sets.length ? `SET ${sets.join(', ')}` : '';
    expression += removes.length ? ` REMOVE ${removes.join(', ')}` : '';

    expressionNames['#version'] = 'version';
    expValues[':version'] = 1;
    expression += ' ADD #version :version';

    return {
        operation: 'UpdateItem',
        key: util.dynamodb.toMapValues(key),
        update: {
            expression,
            expressionNames,
            expressionValues: util.dynamodb.toMapValues(expValues),
        },
        condition: JSON.parse(
            util.transform.toDynamoDBConditionExpression(condition)
        ),
    };
}