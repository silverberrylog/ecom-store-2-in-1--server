export const baseProductSchema = {
    $id: 'productInfo',
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 32 },
        description: { type: 'string' },
        price: { type: 'number', decimals: 2, minimum: 0 },
        taxPercentage: {
            type: 'number',
            decimals: 2,
            minimum: 0,
            maximum: 100,
        },
        inStock: { type: 'boolean' },
        isActive: { type: 'boolean' },
    },
}
