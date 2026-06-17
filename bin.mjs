#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import pargs from 'pargs';

import pruneFootnotes from './index.mjs';

const {
	help,
	errors,
	values: {
		help: helpV,
		input: rawInput,
		'output-file': o,
	},
} = await pargs(import.meta.filename, {
	options: {
		input: {
			description: 'File path containing GFM markdown content. If omitted, input must be piped in.',
			placeholder: 'path',
			short: 'i',
			type: 'string',
		},
		'output-file': {
			description: 'File path to write output to. If omitted, output will be printed to stdout.',
			placeholder: 'path',
			short: 'o',
			type: 'string',
		},
	},
});

const { stdin } = process;

const input = !helpV && !stdin.isTTY && (typeof rawInput !== 'string' || rawInput.length === 0)
	? await new Promise((resolve, reject) => {
		let data = '';

		stdin.setEncoding('utf8');
		stdin.on('data', (chunk) => {
			data += chunk;
		});
		stdin.on('end', () => {
			resolve(data);
		});
		stdin.on('error', reject);
	})
	: typeof rawInput === 'string' && rawInput.length > 0 ? await readFile(
		rawInput.startsWith('/') ? rawInput : join(process.cwd(), rawInput),
		'utf-8',
	) : null;

if (!helpV && (typeof input !== 'string' || input.length === 0)) {
	errors.push('no input provided');
}

await help();

const result = pruneFootnotes(input);

if (typeof o === 'string') {
	await writeFile(o.startsWith('/') ? o : join(process.cwd(), o), result);
	console.error(`Wrote GFM markdown output to ${o}`);
} else {
	console.log(result);
}
