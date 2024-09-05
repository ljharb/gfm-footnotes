import { Marked } from 'marked';
import markedFootnote from 'marked-footnote';

const { entries } = Object;

// eslint-disable-next-line no-extra-parens, max-len
const filter = /** @type {<T, S extends T>(receiver: T[], predicate: (value: T, index?: number, array?: T[]) => value is S) => S[]} */ (
	Function.call.bind(Array.prototype.filter)
);
// eslint-disable-next-line no-extra-parens
const includes = /** @type {(receiver: string, searchString: string, position?: number) => boolean} */ (
	Function.call.bind(String.prototype.includes)
);
// eslint-disable-next-line no-extra-parens
const replaceAll = /** @type {(receiver: string, searchValue: string, replaceValue: string) => string} */ (
	Function.call.bind(String.prototype.replaceAll)
);

/** @type {import('.')} */
export default function pruneFootnotes(input) {
	if (typeof input !== 'string') {
		throw new TypeError('`input` must be a string');
	}

	const lexed = new Marked({ breaks: true, gfm: true })
		.use(markedFootnote())
		.lexer(input);

	const { links } = lexed;
	const tokens = filter(
		lexed,
		// eslint-disable-next-line no-extra-parens
		/** @type {(token: typeof lexed[0]) => token is typeof lexed[0]} */ (({ type }) => type !== 'footnotes'),
	);

	const body = tokens.map((x) => x.raw).join('\n');

	const usedFootnotes = filter(
		// eslint-disable-next-line no-extra-parens
		/** @type {[string, typeof links][]} */ (/** @type {unknown} */ (entries(links))),
		// eslint-disable-next-line no-extra-parens
		/** @type {(entry: [string, typeof links]) => entry is typeof entry} */ (([x]) => includes(body, `[${x}]`)),
	);

	const footer = usedFootnotes.map(([k, { href }]) => `[${k}]: ${href}`).join('\n');

	return replaceAll(`${body}\n${footer}`, /\n\n/g, '\n');
}
