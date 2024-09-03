#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import pargs from './pargs.mjs';

import pruneFootnotes from './index.mjs';

const help = await readFile(join(import.meta.dirname, './help.txt'), 'utf8');

const { values: { input: rawInput, 'output-file': o } } = pargs(help, import.meta.filename, {
	options: {
		input: {
			short: 'i',
			type: 'string',
		},
		'output-file': {
			default: undefined,
			short: 'o',
			type: 'string',
		},
	},
});

const input = typeof rawInput === 'string'
	? rawInput.length > 0 ? await readFile(
		rawInput.startsWith('/') ? rawInput : join(process.cwd(), rawInput),
		'utf-8',
	) : null
	: await new Promise((resolve, reject) => {
		const { stdin } = process;
		let data = '';

		stdin.setEncoding('utf8');
		stdin.on('data', (chunk) => {
			data += chunk;
		});
		stdin.on('end', () => {
			resolve(data);
		});
		stdin.on('error', reject);
	});

if (typeof input !== 'string' || input.length === 0) {
	console.error('no input provided');
	console.log(help);
	process.exit(1);
}

const result = pruneFootnotes(input);

if (typeof o === 'string') {
	await writeFile(o.startsWith('/') ? o : join(process.cwd(), o), result);
	console.error(`Wrote GFM markdown output to ${o}`);
} else {
	console.log(result);
}
