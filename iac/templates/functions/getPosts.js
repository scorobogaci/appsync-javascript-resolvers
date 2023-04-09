
export function request(ctx) {
    const { limit = 20, nextToken } = ctx.arguments;
    return { operation: 'Scan', limit, nextToken };
}

export function response(ctx) {
    const { items: posts = [], nextToken } = ctx.result;
    return { posts, nextToken };
}