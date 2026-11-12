import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const srcRoot = fileURLToPath(new URL('../../src/', import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const resolved = resolveFile(path.join(srcRoot, specifier.slice(2)));
    if (resolved) {
      return {
        url: pathToFileURL(resolved).href,
        shortCircuit: true,
      };
    }
  }

  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    !path.extname(specifier) &&
    context.parentURL
  ) {
    const parent = fileURLToPath(context.parentURL);
    const resolved = resolveFile(path.resolve(path.dirname(parent), specifier));
    if (resolved) {
      return {
        url: pathToFileURL(resolved).href,
        shortCircuit: true,
      };
    }
  }

  return nextResolve(specifier, context);
}

function resolveFile(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}
