import test from 'tape';
import v from 'es-value-fixtures';
import inspect from 'object-inspect';
// @ts-expect-error tmp's types are broken
import tmp from 'tmp';

import { execSync, spawnSync } from 'child_process';
import { readFile, truncate } from 'fs/promises';
import { join, relative, resolve } from 'path';

import pruneFootnotes from '../index.mjs';

const bin = join(import.meta.dirname, '../bin.mjs');

test('pruneFootnotes', async (t) => {
	v.nonStrings.forEach((nonString) => {
		t.throws(
			// @ts-expect-error
			() => pruneFootnotes(nonString),
			`${inspect(nonString)} is not a string`,
		);
	});

	const helpText = (await readFile(join(import.meta.dirname, '../help.txt'), 'utf-8')).trim();

	t.equal(
		`${execSync(`${bin} --help`)}`.trim(),
		helpText,
		'CLI help text is as expected',
	);

	const result = spawnSync(bin, ['-i', ''], {
		stdio: 'pipe',
	});
	t.equal(result.status, 1, 'exits with a non-zero status code when no input is provided');
	t.equal(`${result.stdout}`.trim(), helpText);
	t.equal(`${result.stderr}`.trim(), 'no input provided');

	const tmpFile = tmp.fileSync({ discardDescriptor: true, postfix: '.md' });
	t.teardown(() => tmpFile.removeCallback());

	await Promise.all([
		'changelog',
	].map(async (fixtureName) => {
		const inPath = `./test/fixtures/${fixtureName}/in.md`;
		const expected = (await readFile(join(import.meta.dirname, `./fixtures/${fixtureName}/out.md`), 'utf-8')).trim();

		const relativePath = spawnSync(bin, ['-i', inPath], { stdio: 'pipe' });
		t.equal(relativePath.status, 0, 'exits with a zero status code when a relative path input file is provided');
		t.equal(`${relativePath.stdout}`.trim(), expected.trim());
		t.equal(`${relativePath.stderr}`, '', 'stderr is empty');

		const absolute = spawnSync(bin, ['-i', resolve(inPath)], { stdio: 'pipe' });
		t.equal(absolute.status, 0, 'exits with a zero status code when an absolute path input file is provided');
		t.equal(`${absolute.stdout}`.trim(), expected.trim());
		t.equal(`${absolute.stderr}`, '', 'stderr is empty');

		const stdin = spawnSync(bin, [], { stdio: 'pipe', input: await readFile(inPath, 'utf-8') });
		t.equal(stdin.status, 0, 'exits with a zero status code when stdin input is provided');
		t.equal(`${stdin.stdout}`.trim(), expected.trim());
		t.equal(`${stdin.stderr}`, '', 'stderr is empty');

		const outFile = spawnSync(bin, ['-i', inPath, '-o', tmpFile.name], { stdio: 'pipe' });
		t.equal(outFile.status, 0, 'exits with a zero status code when an output file is provided');
		t.equal(`${outFile.stdout}`, '', 'stdout is empty');
		t.equal(`${outFile.stderr}`, `Wrote GFM markdown output to ${tmpFile.name}\n`, 'stderr is not empty');
		t.equal(
			`${await readFile(tmpFile.name, 'utf-8')}`.trim(),
			expected,
			'output file has expected contents',
		);

		await truncate(tmpFile.name);

		const relativeTmpPath = relative(process.cwd(), tmpFile.name);
		const outRelativeFile = spawnSync(bin, ['-i', inPath, '-o', relativeTmpPath], { stdio: 'pipe' });
		t.equal(outRelativeFile.status, 0, 'exits with a zero status code when an output file is provided');
		t.equal(`${outRelativeFile.stdout}`, '', 'stdout is empty');
		t.equal(`${outRelativeFile.stderr}`, `Wrote GFM markdown output to ${relativeTmpPath}\n`, 'stderr is not empty');
		t.equal(
			`${await readFile(tmpFile.name, 'utf-8')}`.trim(),
			expected,
			'output file has expected contents',
		);
	}));

	t.end();
});
