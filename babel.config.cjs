module.exports = {
    presets: [
        ['@babel/preset-env', { 
            targets: { node: 'current' },
            modules: 'commonjs'
        }],
        '@babel/preset-react',
    ],
    plugins: [
        '@babel/plugin-transform-private-property-in-object',
    ],
    env: {
        test: {
            presets: [
                ['@babel/preset-env', { 
                    targets: { node: 'current' },
                    modules: 'commonjs'
                }],
                '@babel/preset-react',
            ],
            plugins: [
                '@babel/plugin-transform-private-property-in-object',
                // Transform import.meta.env to process.env for tests
                function() {
                    const t = require('@babel/types');
                    return {
                        visitor: {
                            MemberExpression(path) {
                                const node = path.node;
                                // Match: import.meta.env
                                if (
                                    node.object?.type === 'MetaProperty' &&
                                    node.property?.name === 'env'
                                ) {
                                    path.replaceWith(
                                        t.memberExpression(
                                            t.identifier('process'),
                                            t.identifier('env')
                                        )
                                    );
                                }
                            },
                        },
                    };
                },
            ],
        },
    },
};
