import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import test from 'ava';
import {temporaryDirectory} from 'tempy';
import {findUp, findUpSync} from './index.js';

// COPIED FROM https://github.com/sindresorhus/find-up
// DO NOT EDIT HERE

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const name = {
	packageDirectory: 'find-up-simple', // EDITED
	packageJson: 'package.json',
	fixtureDirectory: 'fixture',
	fooDirectory: 'foo',
	barDirectory: 'bar',
	modulesDirectory: 'node_modules',
	baz: 'baz.js',
	qux: 'qux.js',
	fileLink: 'file-link',
	directoryLink: 'directory-link',
	dotDirectory: '.git',
};

// These paths are relative to the project root
const relative = {
	fixtureDirectory: name.fixtureDirectory,
	modulesDirectory: name.modulesDirectory,
};
relative.baz = path.join(relative.fixtureDirectory, name.baz);
relative.qux = path.join(relative.fixtureDirectory, name.qux);
relative.barDirQux = path.join(relative.fixtureDirectory, name.fooDirectory, name.barDirectory, name.qux);
relative.barDir = path.join(relative.fixtureDirectory, name.fooDirectory, name.barDirectory);

const absolute = {
	packageDirectory: __dirname,
};
absolute.packageJson = path.join(absolute.packageDirectory, name.packageJson);
absolute.fixtureDirectory = path.join(
	absolute.packageDirectory,
	name.fixtureDirectory,
);
absolute.baz = path.join(absolute.fixtureDirectory, name.baz);
absolute.qux = path.join(absolute.fixtureDirectory, name.qux);
absolute.fooDir = path.join(absolute.fixtureDirectory, name.fooDirectory);
absolute.barDir = path.join(absolute.fixtureDirectory, name.fooDirectory, name.barDirectory);
absolute.barDirQux = path.join(absolute.fixtureDirectory, name.fooDirectory, name.barDirectory, name.qux);
absolute.fileLink = path.join(absolute.fixtureDirectory, name.fileLink);
absolute.directoryLink = path.join(absolute.fixtureDirectory, name.directoryLink);
absolute.dotDirectory = path.join(__dirname, name.dotDirectory);
absolute.rootTmpDirectory = '/tmp';

const url = {
	fixtureDirectory: pathToFileURL(absolute.fixtureDirectory),
};

// Create a disjoint directory, used for the not-found tests
test.beforeEach(t => {
	t.context.disjoint = temporaryDirectory();
});

test.afterEach(t => {
	fs.rmdirSync(t.context.disjoint);
});

test('async (child file)', async t => {
	const foundPath = await findUp(name.packageJson);

	t.is(foundPath, absolute.packageJson);
});

test('sync (child file)', t => {
	const foundPath = findUpSync(name.packageJson);

	t.is(foundPath, absolute.packageJson);
});

test('async (child directory)', async t => {
	const foundPath = await findUp(name.fixtureDirectory, {type: 'directory'});

	t.is(foundPath, absolute.fixtureDirectory);
});

test('sync (child directory)', t => {
	const foundPath = findUpSync(name.fixtureDirectory, {type: 'directory'});

	t.is(foundPath, absolute.fixtureDirectory);
});

test('async (explicit type file)', async t => {
	t.is(await findUp(name.packageJson, {type: 'file'}), absolute.packageJson);
	t.is(await findUp(name.packageJson, {type: 'directory'}), undefined);
});

test('sync (explicit type file)', t => {
	t.is(findUpSync(name.packageJson, {type: 'file'}), absolute.packageJson);
	t.is(findUpSync(name.packageJson, {type: 'directory'}), undefined);
});

// If (!isWindows) {
// 	test('async (symbolic links)', async t => {
// 		const cwd = absolute.fixtureDirectory;

// 		t.is(await findUp(name.fileLink, {cwd}), absolute.fileLink);
// 		t.is(await findUp(name.fileLink, {cwd, allowSymlinks: false}), undefined);

// 		t.is(await findUp(name.directoryLink, {cwd, type: 'directory'}), absolute.directoryLink);
// 		t.is(await findUp(name.directoryLink, {cwd, type: 'directory', allowSymlinks: false}), undefined);
// 	});

// 	test('sync (symbolic links)', t => {
// 		const cwd = absolute.fixtureDirectory;

// 		t.is(findUpSync(name.fileLink, {cwd}), absolute.fileLink);
// 		t.is(findUpSync(name.fileLink, {cwd, allowSymlinks: false}), undefined);

// 		t.is(findUpSync(name.directoryLink, {cwd, type: 'directory'}), absolute.directoryLink);
// 		t.is(findUpSync(name.directoryLink, {cwd, type: 'directory', allowSymlinks: false}), undefined);
// 	});
// }

test('async (child file, custom cwd)', async t => {
	const foundPath = await findUp(name.baz, {
		cwd: relative.fixtureDirectory,
	});

	t.is(foundPath, absolute.baz);

	const foundPath2 = await findUp(name.baz, {
		cwd: url.fixtureDirectory,
	});
	t.is(foundPath2, foundPath);
});

test('sync (child file, custom cwd)', t => {
	const foundPath = findUpSync(name.baz, {
		cwd: relative.fixtureDirectory,
	});

	t.is(foundPath, absolute.baz);

	const foundPath2 = findUpSync(name.baz, {
		cwd: url.fixtureDirectory,
	});
	t.is(foundPath2, foundPath);
});

/// test('async (child file, array, custom cwd)', async t => {
// 	const foundPath = await findUp([name.baz], {
// 		cwd: relative.fixtureDirectory,
// 	});

// 	t.is(foundPath, absolute.baz);
// });

// test('sync (child file, array, custom cwd)', t => {
// 	const foundPath = findUpSync([name.baz], {
// 		cwd: relative.fixtureDirectory,
// 	});

// 	t.is(foundPath, absolute.baz);
// });

// test('async (first child file, array, custom cwd)', async t => {
// 	const foundPath = await findUp([name.qux, name.baz], {
// 		cwd: relative.fixtureDirectory,
// 	});

// 	t.is(foundPath, absolute.qux);
// });

// test('sync (first child file, array, custom cwd)', t => {
// 	const foundPath = findUpSync([name.qux, name.baz], {
// 		cwd: relative.fixtureDirectory,
// 	});

// 	t.is(foundPath, absolute.qux);
// });

// test('async (second child file, array, custom cwd)', async t => {
// 	const foundPath = await findUp(['fake', name.baz], {
// 		cwd: relative.fixtureDirectory,
// 	});

// 	t.is(foundPath, absolute.baz);
// });

// test('sync (second child file, array, custom cwd)', t => {
// 	const foundPath = findUpSync(['fake', name.baz], {
// 		cwd: relative.fixtureDirectory,
// 	});

// 	t.is(foundPath, absolute.baz);
// });

test('async (cwd)', async t => {
	const foundPath = await findUp(name.packageDirectory, {
		cwd: absolute.packageDirectory,
		type: 'directory',
	});

	t.is(foundPath, absolute.packageDirectory);
});

test('sync (cwd)', t => {
	const foundPath = findUpSync(name.packageDirectory, {
		cwd: absolute.packageDirectory,
		type: 'directory',
	});

	t.is(foundPath, absolute.packageDirectory);
});

test('async (cousin file, custom cwd)', async t => {
	const foundPath = await findUp(name.baz, {
		cwd: relative.barDir,
	});

	t.is(foundPath, absolute.baz);
});

test('sync (cousin file, custom cwd)', t => {
	const foundPath = findUpSync(name.baz, {
		cwd: relative.barDir,
	});

	t.is(foundPath, absolute.baz);
});

test('async (cousin file, custom cwd with stopAt)', async t => {
	const foundPath = await findUp(name.baz, {
		cwd: relative.barDir,
		stopAt: absolute.fooDir,
	});

	t.is(foundPath, undefined);
});

test('sync (cousin file, custom cwd with stopAt)', t => {
	const foundPath = findUpSync(name.baz, {
		cwd: relative.barDir,
		stopAt: absolute.fooDir,
	});

	t.is(foundPath, undefined);
});

test('async (cousin file, custom cwd, stopAt equal to foundPath)', async t => {
	const foundPath = await findUp(name.baz, {
		cwd: relative.barDir,
		stopAt: absolute.baz,
	});

	t.is(foundPath, absolute.baz);
});

test('sync (cousin file, custom cwd, stopAt equal to foundPath)', t => {
	const foundPath = findUpSync(name.baz, {
		cwd: relative.barDir,
		stopAt: absolute.baz,
	});

	t.is(foundPath, absolute.baz);
});

test('async (nested descendant file)', async t => {
	const foundPath = await findUp(relative.baz);

	t.is(foundPath, absolute.baz);
});

test('sync (nested descendant file)', t => {
	const foundPath = findUpSync(relative.baz);

	t.is(foundPath, absolute.baz);
});

test('async (nested descendant directory)', async t => {
	const foundPath = await findUp(relative.barDir, {type: 'directory'});

	t.is(foundPath, absolute.barDir);
});

test('sync (nested descendant directory)', t => {
	const foundPath = findUpSync(relative.barDir, {type: 'directory'});

	t.is(foundPath, absolute.barDir);
});

test('async (nested descendant directory, custom cwd)', async t => {
	const filePath = await findUp(relative.barDir, {
		cwd: relative.modulesDirectory,
		type: 'directory',
	});

	t.is(filePath, absolute.barDir);
});

test('sync (nested descendant directory, custom cwd)', t => {
	const filePath = findUpSync(relative.barDir, {
		cwd: relative.modulesDirectory,
		type: 'directory',
	});

	t.is(filePath, absolute.barDir);
});

test('async (nested cousin directory, custom cwd)', async t => {
	const foundPath = await findUp(relative.barDir, {
		cwd: relative.fixtureDirectory,
		type: 'directory',
	});

	t.is(foundPath, absolute.barDir);
});

test('sync (nested cousin directory, custom cwd)', t => {
	const foundPath = findUpSync(relative.barDir, {
		cwd: relative.fixtureDirectory,
		type: 'directory',
	});

	t.is(foundPath, absolute.barDir);
});

test('async (ancestor directory, custom cwd)', async t => {
	const foundPath = await findUp(name.fixtureDirectory, {
		cwd: relative.barDir,
		type: 'directory',
	});

	t.is(foundPath, absolute.fixtureDirectory);
});

test('sync (ancestor directory, custom cwd)', t => {
	const foundPath = findUpSync(name.fixtureDirectory, {
		cwd: relative.barDir,
		type: 'directory',
	});

	t.is(foundPath, absolute.fixtureDirectory);
});

test('async (absolute directory)', async t => {
	const filePath = await findUp(absolute.barDir, {type: 'directory'});

	t.is(filePath, absolute.barDir);
});

test('sync (absolute directory)', t => {
	const filePath = findUpSync(absolute.barDir, {type: 'directory'});

	t.is(filePath, absolute.barDir);
});

test('async (not found, absolute file)', async t => {
	const filePath = await findUp(path.resolve('somenonexistentfile.js'));

	t.is(filePath, undefined);
});

test('sync (not found, absolute file)', t => {
	const filePath = findUpSync(path.resolve('somenonexistentfile.js'));

	t.is(filePath, undefined);
});

test('async (absolute directory, disjoint cwd)', async t => {
	const filePath = await findUp(absolute.barDir, {
		cwd: t.context.disjoint,
		type: 'directory',
	});

	t.is(filePath, absolute.barDir);
});

test('sync (absolute directory, disjoint cwd)', t => {
	const filePath = findUpSync(absolute.barDir, {
		cwd: t.context.disjoint,
		type: 'directory',
	});

	t.is(filePath, absolute.barDir);
});

test('async (not found)', async t => {
	const foundPath = await findUp('somenonexistentfile.js');

	t.is(foundPath, undefined);
});

test('sync (not found)', t => {
	const foundPath = findUpSync('somenonexistentfile.js');

	t.is(foundPath, undefined);
});

// Both tests start in a disjoint directory. `package.json` should not be found
// and `undefined` should be returned.
test('async (not found, custom cwd)', async t => {
	const foundPath = await findUp(name.packageJson, {
		cwd: t.context.disjoint,
	});

	t.is(foundPath, undefined);
});

test('sync (not found, custom cwd)', t => {
	const foundPath = findUpSync(name.packageJson, {
		cwd: t.context.disjoint,
	});

	t.is(foundPath, undefined);
});

test('async (dot directory)', async t => {
	const foundPath = await findUp(name.dotDirectory, {type: 'directory'});
	t.is(foundPath, absolute.dotDirectory);
});

test('sync (dot directory)', t => {
	const foundPath = findUpSync(name.dotDirectory, {type: 'directory'});
	t.is(foundPath, absolute.dotDirectory);
});

test('async (root/stopAt directory)', async t => {
	const foundPath = await findUp('tmp', {type: 'directory'});
	t.is(foundPath, absolute.rootTmpDirectory);
});

test('sync (root/stopAt directory)', t => {
	const foundPath = findUpSync('tmp', {type: 'directory'});
	t.is(foundPath, absolute.rootTmpDirectory);
});
