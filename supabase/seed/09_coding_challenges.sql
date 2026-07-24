-- InterviewForge seed — 09: coding challenges (practice + interview)
-- Six approved challenges aligned with MockCodeExecutionProvider fixtures
-- (slugs: two-sum, reverse-string, fizzbuzz, valid-parentheses, palindrome-number, max-subarray).
-- Safe to re-run: challenges use on conflict (slug) do nothing; test cases insert only when empty.

with js as (select id from public.technologies where slug = 'javascript'),
     py as (select id from public.technologies where slug = 'python'),
     dsa as (select id from public.technologies where slug = 'dsa')
insert into public.coding_challenges (
  technology_id, title, slug, problem_statement, difficulty, examples, constraints,
  starter_code, supported_languages, expected_time_complexity, expected_space_complexity,
  time_limit_ms, memory_limit_mb, status
)
values
(
  (select id from dsa),
  'Two Sum',
  'two-sum',
  $md$
## Two Sum

Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`.

You may assume each input has exactly one solution, and you may not use the same element twice.

### Input format
- Line 1: space-separated integers (`nums`)
- Line 2: integer (`target`)

### Output format
- Two space-separated indices (0-based), in ascending order of index.
$md$,
  'easy',
  '[{"input":"2 7 11 15\\n9","output":"0 1","explanation":"nums[0] + nums[1] == 9"},{"input":"3 2 4\\n6","output":"1 2"}]'::jsonb,
  '2 <= nums.length <= 10^4. Exactly one valid answer.',
  jsonb_build_object(
    'javascript', E'// Read stdin: nums on line 1, target on line 2.\n// Print two indices. Mark SOLUTION when done.\nconst fs = require("fs");\nconst lines = fs.readFileSync(0, "utf8").trim().split("\\n");\nconst nums = lines[0].split(" ").map(Number);\nconst target = Number(lines[1]);\n\nfunction twoSum(nums, target) {\n  throw new Error("TODO");\n}\n\nconst [i, j] = twoSum(nums, target);\nconsole.log(i, j);\n',
    'typescript', E'// SOLUTION marker required for mock grading until Judge0 is enabled.\nimport * as fs from "fs";\nconst lines = fs.readFileSync(0, "utf8").trim().split("\\n");\nconst nums = lines[0].split(" ").map(Number);\nconst target = Number(lines[1]);\nfunction twoSum(nums: number[], target: number): [number, number] {\n  throw new Error("TODO");\n}\nconst [i, j] = twoSum(nums, target);\nconsole.log(i, j);\n',
    'python', E'# Read nums and target from stdin; print two indices.\ndef two_sum(nums, target):\n    raise NotImplementedError\n\nimport sys\nlines = sys.stdin.read().strip().splitlines()\nnums = list(map(int, lines[0].split()))\ntarget = int(lines[1])\ni, j = two_sum(nums, target)\nprint(i, j)\n',
    'java', E'import java.util.*;\npublic class Main {\n  static int[] twoSum(int[] nums, int target) {\n    throw new UnsupportedOperationException("TODO");\n  }\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String[] parts = sc.nextLine().trim().split(" ");\n    int[] nums = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n    int target = Integer.parseInt(sc.nextLine().trim());\n    int[] ans = twoSum(nums, target);\n    System.out.println(ans[0] + " " + ans[1]);\n  }\n}\n'
  ),
  array['javascript','typescript','python','java'],
  'O(n)',
  'O(n)',
  2000,
  256,
  'approved'
),
(
  (select id from js),
  'Reverse String',
  'reverse-string',
  $md$
## Reverse String

Read a single string from stdin and print its reverse.

### Example
Input: `hello`  
Output: `olleh`
$md$,
  'easy',
  '[{"input":"hello","output":"olleh"},{"input":"InterviewForge","output":"egroFweivretnI"}]'::jsonb,
  '1 <= s.length <= 10^5. ASCII printable characters.',
  jsonb_build_object(
    'javascript', E'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf8").trim();\nfunction reverse(s) {\n  throw new Error("TODO");\n}\nconsole.log(reverse(s));\n',
    'python', E'import sys\ns = sys.stdin.read().strip()\ndef reverse(s):\n    raise NotImplementedError\nprint(reverse(s))\n'
  ),
  array['javascript','python'],
  'O(n)',
  'O(n)',
  2000,
  256,
  'approved'
),
(
  (select id from js),
  'FizzBuzz',
  'fizzbuzz',
  $md$
## FizzBuzz

Given an integer `n`, print the FizzBuzz sequence from 1 to `n` (one token per line):

- Multiples of 3 → `Fizz`
- Multiples of 5 → `Buzz`
- Multiples of both → `FizzBuzz`
- Otherwise the number itself

### Input
A single integer `n`.
$md$,
  'easy',
  '[{"input":"5","output":"1\\n2\\nFizz\\n4\\nBuzz"}]'::jsonb,
  '1 <= n <= 10^4',
  jsonb_build_object(
    'javascript', E'const fs = require("fs");\nconst n = Number(fs.readFileSync(0, "utf8").trim());\nfunction fizzBuzz(n) {\n  throw new Error("TODO");\n}\nconsole.log(fizzBuzz(n).join("\\n"));\n',
    'python', E'import sys\nn = int(sys.stdin.read().strip())\ndef fizz_buzz(n):\n    raise NotImplementedError\nprint("\\n".join(fizz_buzz(n)))\n',
    'java', E'import java.util.*;\npublic class Main {\n  static List<String> fizzBuzz(int n) {\n    throw new UnsupportedOperationException("TODO");\n  }\n  public static void main(String[] args) {\n    int n = new Scanner(System.in).nextInt();\n    for (String s : fizzBuzz(n)) System.out.println(s);\n  }\n}\n'
  ),
  array['javascript','python','java'],
  'O(n)',
  'O(1)',
  2000,
  256,
  'approved'
),
(
  (select id from dsa),
  'Valid Parentheses',
  'valid-parentheses',
  $md$
## Valid Parentheses

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:

1. Open brackets are closed by the same type of brackets.
2. Open brackets are closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Input / Output
- Input: the string on a single line
- Output: `true` or `false`
$md$,
  'easy',
  '[{"input":"()","output":"true"},{"input":"(]","output":"false"}]'::jsonb,
  '1 <= s.length <= 10^4',
  jsonb_build_object(
    'javascript', E'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf8").trim();\nfunction isValid(s) {\n  throw new Error("TODO");\n}\nconsole.log(isValid(s) ? "true" : "false");\n',
    'typescript', E'import * as fs from "fs";\nconst s = fs.readFileSync(0, "utf8").trim();\nfunction isValid(s: string): boolean {\n  throw new Error("TODO");\n}\nconsole.log(isValid(s) ? "true" : "false");\n',
    'python', E'import sys\ns = sys.stdin.read().strip()\ndef is_valid(s):\n    raise NotImplementedError\nprint("true" if is_valid(s) else "false")\n'
  ),
  array['javascript','typescript','python'],
  'O(n)',
  'O(n)',
  2000,
  256,
  'approved'
),
(
  (select id from py),
  'Palindrome Number',
  'palindrome-number',
  $md$
## Palindrome Number

Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.

Negative numbers are not palindromes.

### Input / Output
- Input: a single integer
- Output: `true` or `false`
$md$,
  'easy',
  '[{"input":"121","output":"true"},{"input":"-121","output":"false"}]'::jsonb,
  '-2^31 <= x <= 2^31 - 1',
  jsonb_build_object(
    'javascript', E'const fs = require("fs");\nconst x = Number(fs.readFileSync(0, "utf8").trim());\nfunction isPalindrome(x) {\n  throw new Error("TODO");\n}\nconsole.log(isPalindrome(x) ? "true" : "false");\n',
    'python', E'import sys\nx = int(sys.stdin.read().strip())\ndef is_palindrome(x):\n    raise NotImplementedError\nprint("true" if is_palindrome(x) else "false")\n'
  ),
  array['javascript','python'],
  'O(log n)',
  'O(1)',
  2000,
  256,
  'approved'
),
(
  (select id from dsa),
  'Maximum Subarray',
  'max-subarray',
  $md$
## Maximum Subarray (Kadane)

Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum, and return that sum.

### Input
Space-separated integers on one line.

### Output
A single integer — the maximum subarray sum.
$md$,
  'medium',
  '[{"input":"-2 1 -3 4 -1 2 1 -5 4","output":"6","explanation":"[4,-1,2,1] has the largest sum = 6"}]'::jsonb,
  '1 <= nums.length <= 10^5',
  jsonb_build_object(
    'javascript', E'const fs = require("fs");\nconst nums = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);\nfunction maxSubArray(nums) {\n  throw new Error("TODO");\n}\nconsole.log(maxSubArray(nums));\n',
    'python', E'import sys\nnums = list(map(int, sys.stdin.read().split()))\ndef max_sub_array(nums):\n    raise NotImplementedError\nprint(max_sub_array(nums))\n',
    'java', E'import java.util.*;\npublic class Main {\n  static int maxSubArray(int[] nums) {\n    throw new UnsupportedOperationException("TODO");\n  }\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int[] nums = Arrays.stream(sc.nextLine().trim().split("\\\\s+")).mapToInt(Integer::parseInt).toArray();\n    System.out.println(maxSubArray(nums));\n  }\n}\n'
  ),
  array['javascript','python','java'],
  'O(n)',
  'O(1)',
  3000,
  256,
  'approved'
)
on conflict (slug) do nothing;

-- Test cases (visible + hidden). Insert only when the challenge has none yet.
insert into public.coding_test_cases (challenge_id, input, expected_output, is_hidden, order_index, weight)
select c.id, v.input, v.expected_output, v.is_hidden, v.order_index, v.weight
from public.coding_challenges c
join (values
  -- two-sum
  ('two-sum', '2 7 11 15' || E'\n' || '9', '0 1', false, 0, 1.0),
  ('two-sum', '3 2 4' || E'\n' || '6', '1 2', false, 1, 1.0),
  ('two-sum', '3 3' || E'\n' || '6', '0 1', true, 2, 1.5),
  -- reverse-string
  ('reverse-string', 'hello', 'olleh', false, 0, 1.0),
  ('reverse-string', 'InterviewForge', 'egroFweivretnI', false, 1, 1.0),
  ('reverse-string', 'a', 'a', true, 2, 1.0),
  -- fizzbuzz
  ('fizzbuzz', '5', E'1\n2\nFizz\n4\nBuzz', false, 0, 1.0),
  ('fizzbuzz', '15', E'1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', true, 1, 2.0),
  -- valid-parentheses
  ('valid-parentheses', '()', 'true', false, 0, 1.0),
  ('valid-parentheses', '()[]{}', 'true', false, 1, 1.0),
  ('valid-parentheses', '(]', 'false', false, 2, 1.0),
  ('valid-parentheses', '([)]', 'false', true, 3, 1.5),
  ('valid-parentheses', '{[]}', 'true', true, 4, 1.5),
  -- palindrome-number
  ('palindrome-number', '121', 'true', false, 0, 1.0),
  ('palindrome-number', '-121', 'false', false, 1, 1.0),
  ('palindrome-number', '10', 'false', true, 2, 1.0),
  -- max-subarray
  ('max-subarray', '-2 1 -3 4 -1 2 1 -5 4', '6', false, 0, 1.0),
  ('max-subarray', '1', '1', false, 1, 1.0),
  ('max-subarray', '5 4 -1 7 8', '23', true, 2, 2.0)
) as v(slug, input, expected_output, is_hidden, order_index, weight)
  on c.slug = v.slug
where not exists (
  select 1 from public.coding_test_cases t where t.challenge_id = c.id
);
