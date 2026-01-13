import ljharbConfig from '@ljharb/eslint-config/flat';

export default [
	...ljharbConfig,
	{
		languageOptions: {
			globals: {
				Float64Array: false,
				Uint8Array: false,
			},
		},
		rules: {
			complexity: 'off',
			'id-length': 'off',
			'max-lines-per-function': 'off',
			'max-statements': 'off',
			'multiline-comment-style': 'off',
			'new-cap': [
				'error', {
					capIsNewExceptions: [
						'DetachArrayBuffer',
						'FromBase64',
						'FromHex',
						'Get',
						'GetIntrinsic',
						'GetOptionsObject',
						'GetUint8ArrayBytes',
						'IsTypedArrayOutOfBounds',
						'MakeTypedArrayWithBufferWitnessRecord',
						'NumberToString',
						'SetUint8ArrayBytes',
						'SetValueInBuffer',
						'StringPad',
						'ToBoolean',
						'TypedArrayLength',
						'ValidateUint8Array',
					],
				},
			],
			'sort-keys': 'off',
		},
	},
	{
		files: ['Uint8Array.prototype.toBase64/implementation.js'],
		rules: {
			'operator-linebreak': ['error', 'before'],
		},
	},
	{
		files: ['aos/FromBase64.js'],
		rules: {
			'max-depth': 'off',
		},
	},
	{
		files: ['aos/DecodeBase64Chunk.js'],
		rules: {
			'no-param-reassign': 'off',
			'operator-linebreak': ['error', 'before'],
		},
	},
	{
		files: ['aos/**/*.js'],
		rules: {
			'new-cap': [
				'error', {
					capIsNewExceptions: [
						'ArrayBufferByteLength',
						'DecodeBase64Chunk',
						'GetIntrinsic',
						'GetValueFromBuffer',
						'IsDetachedBuffer',
						'IsFixedLengthArrayBuffer',
						'IsResizableArrayBuffer',
						'IsTypedArrayOutOfBounds',
						'MakeTypedArrayWithBufferWitnessRecord',
						'OrdinaryObjectCreate',
						'SetValueInBuffer',
						'SkipAsciiWhitespace',
						'Type',
						'TypedArrayElementSize',
						'TypedArrayLength',
						'ValidateUint8Array',
					],
				},
			],
		},
	},
];
