/**
 * Supported languages for coding challenges (editor + Judge0 CE IDs).
 * @see https://github.com/judge0/judge0/blob/master/CHANGELOG.md
 */
export const CODING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "ruby",
  "php",
  "kotlin",
  "swift",
  "scala",
  "sql",
  "bash",
  "r",
  "lua",
  "perl",
  "haskell",
  "dart",
] as const;

export type CodingLanguage = (typeof CODING_LANGUAGES)[number];

export const CODING_LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  kotlin: "Kotlin",
  swift: "Swift",
  scala: "Scala",
  sql: "SQL",
  bash: "Bash",
  r: "R",
  lua: "Lua",
  perl: "Perl",
  haskell: "Haskell",
  dart: "Dart",
};

/** Monaco editor language ids. */
export const MONACO_LANGUAGE_IDS: Record<CodingLanguage, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  csharp: "csharp",
  cpp: "cpp",
  c: "c",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  kotlin: "kotlin",
  swift: "swift",
  scala: "scala",
  sql: "sql",
  bash: "shell",
  r: "r",
  lua: "lua",
  perl: "perl",
  haskell: "haskell",
  dart: "dart",
};

/**
 * Judge0 CE language IDs (community edition stable subset).
 */
export const JUDGE0_LANGUAGE_IDS: Record<CodingLanguage, number> = {
  javascript: 63, // Node.js
  typescript: 74,
  python: 71, // Python 3
  java: 62, // OpenJDK
  csharp: 51, // Mono
  cpp: 54, // GCC
  c: 50, // GCC
  go: 60,
  rust: 73,
  ruby: 72,
  php: 68,
  kotlin: 78,
  swift: 83,
  scala: 81,
  sql: 82,
  bash: 46,
  r: 80,
  lua: 64,
  perl: 85,
  haskell: 61,
  dart: 104,
};

export function isCodingLanguage(value: string): value is CodingLanguage {
  return (CODING_LANGUAGES as readonly string[]).includes(value);
}

/** Default incomplete starter stub per language (AI may replace these). */
export function defaultStarterCode(language: CodingLanguage): string {
  switch (language) {
    case "python":
      return "# Read stdin, write answer to stdout.\nimport sys\n\ndef solve():\n    raise NotImplementedError\n\nprint(solve())\n";
    case "java":
      return "import java.util.*;\npublic class Main {\n  static String solve() {\n    throw new UnsupportedOperationException(\"TODO\");\n  }\n  public static void main(String[] args) {\n    System.out.println(solve());\n  }\n}\n";
    case "csharp":
      return "using System;\nclass Program {\n  static string Solve() => throw new NotImplementedException();\n  static void Main() => Console.WriteLine(Solve());\n}\n";
    case "cpp":
      return "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  // TODO: read stdin, write stdout\n  return 0;\n}\n";
    case "c":
      return "#include <stdio.h>\nint main() {\n  /* TODO: read stdin, write stdout */\n  return 0;\n}\n";
    case "go":
      return "package main\nimport \"fmt\"\nfunc solve() string { panic(\"TODO\") }\nfunc main() { fmt.Println(solve()) }\n";
    case "rust":
      return "fn solve() -> String { todo!() }\nfn main() { println!(\"{}\", solve()); }\n";
    case "ruby":
      return "def solve\n  raise \"TODO\"\nend\nputs solve\n";
    case "php":
      return "<?php\nfunction solve() { throw new Exception('TODO'); }\necho solve();\n";
    case "kotlin":
      return "fun solve(): String = TODO()\nfun main() { println(solve()) }\n";
    case "swift":
      return "func solve() -> String { fatalError(\"TODO\") }\nprint(solve())\n";
    case "scala":
      return "object Main {\n  def solve(): String = ???\n  def main(args: Array[String]): Unit = println(solve())\n}\n";
    case "sql":
      return "-- Write your SQL query below\nSELECT 1;\n";
    case "bash":
      return "#!/bin/bash\n# TODO: read stdin, write stdout\nexit 1\n";
    case "r":
      return "solve <- function() {\n  stop(\"TODO\")\n}\ncat(solve())\n";
    case "lua":
      return "function solve()\n  error(\"TODO\")\nend\nprint(solve())\n";
    case "perl":
      return "sub solve { die \"TODO\"; }\nprint solve();\n";
    case "haskell":
      return "solve :: String\nsolve = error \"TODO\"\nmain = putStrLn solve\n";
    case "dart":
      return "String solve() => throw UnimplementedError();\nvoid main() { print(solve()); }\n";
    case "typescript":
      return "// Read stdin, write answer to stdout.\nimport * as fs from \"fs\";\nfunction solve(input: string): string {\n  throw new Error(\"TODO\");\n}\nconst input = fs.readFileSync(0, \"utf8\").trim();\nconsole.log(solve(input));\n";
    case "javascript":
    default:
      return "// Read stdin, write answer to stdout.\nconst fs = require(\"fs\");\nfunction solve(input) {\n  throw new Error(\"TODO\");\n}\nconst input = fs.readFileSync(0, \"utf8\").trim();\nconsole.log(solve(input));\n";
  }
}
