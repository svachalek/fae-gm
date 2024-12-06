import { readFile } from "node:fs/promises";

export async function catFiles(
  filenames: string[],
  separator = "",
): Promise<string> {
  const contents = await Promise.all(
    filenames.map((filename) => readFile(filename, "utf-8")),
  );
  return contents.join(separator);
}
