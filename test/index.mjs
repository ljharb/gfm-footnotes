import test from 'tape';
import v from 'es-value-fixtures';
import inspect from 'object-inspect';
import tmp from 'tmp';

import { exec, execSync, spawn, spawnSync } from 'child_process';
import { readFile, readdir, truncate } from 'fs/promises';
import { join, relative, resolve } from 'path';
import { promisify } from 'util';

const execP = promisify(exec);

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

	const helpText = `${execSync(`${bin} --help`)}`.trim();

	const result = spawnSync(bin, ['-i', ''], {
		stdio: 'pipe',
	});
	t.equal(result.status, 1, 'exits with a non-zero status code when no input is provided');
	t.equal(`${result.stdout}`.trim(), helpText);
	t.equal(`${result.stderr}`.trim(), 'no input provided');

	const tmpFile = tmp.fileSync({ discardDescriptor: true, postfix: '.md' });
	t.teardown(() => tmpFile.removeCallback());

	await Promise.all((await readdir(join(import.meta.dirname, 'fixtures'), { withFileTypes: true }))
		.filter((x) => x.isDirectory())
		.map(async ({ name: fixtureName }) => {
			t.test(`fixture: ${fixtureName}`, async (st) => {
				const inPath = `./test/fixtures/${fixtureName}/in.md`;
				const expected = (await readFile(join(import.meta.dirname, `./fixtures/${fixtureName}/out.md`), 'utf-8')).trim();

				const relativePath = spawnSync(bin, ['-i', inPath], { stdio: 'pipe' });
				st.equal(relativePath.status, 0, 'exits with a zero status code when a relative path input file is provided');
				st.equal(`${relativePath.stdout}`.trim(), expected.trim());
				st.equal(`${relativePath.stderr}`, '', 'stderr is empty');

				const absolute = spawnSync(bin, ['-i', resolve(inPath)], { stdio: 'pipe' });
				st.equal(absolute.status, 0, 'exits with a zero status code when an absolute path input file is provided');
				st.equal(`${absolute.stdout}`.trim(), expected.trim());
				st.equal(`${absolute.stderr}`, '', 'stderr is empty');

				const stdin = spawnSync(bin, [], { stdio: 'pipe', input: await readFile(inPath, 'utf-8') });
				st.equal(stdin.status, 0, 'exits with a zero status code when stdin input is provided');
				st.equal(`${stdin.stdout}`.trim(), expected.trim());
				st.equal(`${stdin.stderr}`, '', 'stderr is empty');

				const outFile = spawnSync(bin, ['-i', inPath, '-o', tmpFile.name], { stdio: 'pipe' });
				st.equal(outFile.status, 0, 'exits with a zero status code when an output file is provided');
				st.equal(`${outFile.stdout}`, '', 'stdout is empty');
				st.equal(`${outFile.stderr}`, `Wrote GFM markdown output to ${tmpFile.name}\n`, 'stderr is not empty');
				st.equal(
					`${await readFile(tmpFile.name, 'utf-8')}`.trim(),
					expected,
					'output file has expected contents',
				);

				await truncate(tmpFile.name);

				const relativeTmpPath = relative(process.cwd(), tmpFile.name);
				const outRelativeFile = spawnSync(bin, ['-i', inPath, '-o', relativeTmpPath], { stdio: 'pipe' });
				st.equal(outRelativeFile.status, 0, 'exits with a zero status code when an output file is provided');
				st.equal(`${outRelativeFile.stdout}`, '', 'stdout is empty');
				st.equal(`${outRelativeFile.stderr}`, `Wrote GFM markdown output to ${relativeTmpPath}\n`, 'stderr is not empty');
				const actual = `${await readFile(tmpFile.name, 'utf-8')}`.trim();
				st.equal(
					actual,
					expected,
					'output file has expected contents',
				);

				st.test('piped input', async (s2t) => {
					const promise = execP(`cat ${inPath} | ${bin}`);

					let timer;
					await Promise.race([
						new Promise((r) => { timer = setTimeout(r, 1e3); })
							.then(() => s2t.fail('timed out')),
						promise,
					]);
					clearTimeout(timer);

					const pipeResult = await promise;
					s2t.equal(pipeResult.stdout.trim(), expected, 'stdout is as expected');
					s2t.equal(pipeResult.stderr, '', 'stderr is empty');
				});

				st.end();
			});
		}));

	t.test('no input provided', async (st) => {
		st.test('stdin is a TTY (interactive)', async (s1) => {
			/*
			 * Inherit stdin to make it a TTY. With the bug, the process will hang.
			 * After the fix, it should exit with code 1 and print error/help.
			 */
			/** @type {import('child_process').ChildProcess | null} */
			let child = null;
			/** @type {Promise<{ code: number | null, stdout: string, stderr: string }>} */
			const p = new Promise((resolveP, rejectP) => {
				child = spawn(bin, [], { stdio: ['inherit', 'pipe', 'pipe'] });
				let stdout = '';
				let stderr = '';

				child.stdout?.on('data', /** @param {Buffer} chunk */ (chunk) => { stdout += chunk; });
				child.stderr?.on('data', /** @param {Buffer} chunk */ (chunk) => { stderr += chunk; });

				child.on('exit', /** @param {number | null} code */ (code) => {
					resolveP({ code, stdout, stderr });
				});
				child.on('error', rejectP);
			});

			let timer;
			const raced = await Promise.race([
				new Promise((r) => {
					timer = setTimeout(() => {
						s1.fail('timed out - CLI hung waiting for input instead of exiting with error');
						if (child) { child.kill(); }
						r(null);
					}, 1e3);
				}),
				p,
			]);

			if (timer) { clearTimeout(timer); }
			if (raced) {
				s1.equal(raced.code, 1, 'exit code is 1');
				s1.ok(raced.stderr.includes('no input provided'), 'stderr contains error message');
				s1.ok(raced.stdout.includes('Usage: gfm-footnotes'), 'stdout contains help text');
			}
			s1.end();
		});

		st.test('stdin is piped EOF (non-tty)', async (s2) => {
			/*
			 * Use a pipe for stdin, immediately close it to simulate an empty input stream.
			 * The CLI should treat this as no input provided and exit with code 1.
			 */
			/** @type {Promise<{ code: number | null, stdout: string, stderr: string }>} */
			const p = new Promise((resolveP, rejectP) => {
				const child = spawn(bin, [], { stdio: ['pipe', 'pipe', 'pipe'] });
				let stdout = '';
				let stderr = '';

				child.stdout?.on('data', /** @param {Buffer} chunk */ (chunk) => { stdout += chunk; });
				child.stderr?.on('data', /** @param {Buffer} chunk */ (chunk) => { stderr += chunk; });

				/* close stdin immediately -> EOF */
				child.stdin?.end();

				child.on('exit', /** @param {number | null} code */ (code) => {
					resolveP({ code, stdout, stderr });
				});
				child.on('error', rejectP);
			});

			const out = await p;
			s2.equal(out.code, 1, 'exit code is 1 for empty piped input');
			s2.ok(out.stderr.includes('no input provided'), 'stderr contains error message');
			s2.ok(out.stdout.includes('Usage: gfm-footnotes'), 'stdout contains help text');
			s2.end();
		});

		st.end();
	});
	t.end();
});
