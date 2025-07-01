import type { Problem } from './types';

const problems: Problem[] = [
  {
    id: 'average-of-3-numbers',
    title: 'Average of 3 Numbers',
    description: 'A fundamental problem to calculate the average of three given numbers. This helps in understanding basic arithmetic operations and variable handling in programming.',
    tags: ['avg', 'basic', 'math', 'easy'],
    code: {
      c: `
#include <stdio.h>

int main() {
    float num1, num2, num3, avg;
    printf("Enter three numbers: ");
    scanf("%f %f %f", &num1, &num2, &num3);
    avg = (num1 + num2 + num3) / 3.0;
    printf("Average = %.2f", avg);
    return 0;
}
      `,
      cpp: `
#include <iostream>
#include <iomanip>

int main() {
    float num1, num2, num3, avg;
    std::cout << "Enter three numbers: ";
    std::cin >> num1 >> num2 >> num3;
    avg = (num1 + num2 + num3) / 3.0;
    std::cout << "Average = " << std::fixed << std::setprecision(2) << avg;
    return 0;
}
      `,
      py: `
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
num3 = float(input("Enter third number: "))
avg = (num1 + num2 + num3) / 3
print(f"The average is {avg:.2f}")
      `,
    },
    flowchart: `
graph TD
    A[Start] --> B{Input a, b, c};
    B --> C[Process: sum = a + b + c];
    C --> D[Process: avg = sum / 3];
    D --> E{Output avg};
    E --> F[End];
    `,
    stats: {
      likes: 125,
      saves: 42,
      solutions: { c: 5, cpp: 12, py: 25 },
    },
    comments: [
      { id: '1', author: 'coder_cat', avatar: '🐱', text: 'Nice and simple! Great for beginners.', timestamp: '2 days ago' },
      { id: '2', author: 'logic_lord', avatar: '👑', text: 'Could be optimized by reading all numbers at once.', timestamp: '1 day ago' },
    ],
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Check',
    description: 'This problem involves checking if a given string is a palindrome, meaning it reads the same forwards and backwards. It\'s a classic for practicing string manipulation and loops.',
    tags: ['string', 'palindrome', 'loop', 'medium'],
    code: {
      py: `
def is_palindrome(s):
    s = ''.join(filter(str.isalnum, s)).lower()
    return s == s[::-1]

string_to_check = "A man, a plan, a canal: Panama"
if is_palindrome(string_to_check):
    print(f'"{string_to_check}" is a palindrome.')
else:
    print(f'"{string_to_check}" is not a palindrome.')
      `,
      cpp: `
#include <iostream>
#include <string>
#include <algorithm>
#include <cctype>

bool isPalindrome(std::string s) {
    std::string filtered_s;
    for (char c : s) {
        if (std::isalnum(c)) {
            filtered_s += std::tolower(c);
        }
    }
    std::string reversed_s = filtered_s;
    std::reverse(reversed_s.begin(), reversed_s.end());
    return filtered_s == reversed_s;
}

int main() {
    std::string to_check = "racecar";
    if (isPalindrome(to_check)) {
        std::cout << "'" << to_check << "' is a palindrome." << std::endl;
    } else {
        std::cout << "'" << to_check << "' is not a palindrome." << std::endl;
    }
    return 0;
}
      `
    },
    flowchart: `
graph TD
    A[Start] --> B{Input string S};
    B --> C[Clean S: remove non-alphanumeric & tolower];
    C --> D[Create reversed string R from S];
    D --> E{Is S == R?};
    E -- Yes --> F[Output "Is Palindrome"];
    E -- No --> G[Output "Not a Palindrome"];
    F --> H[End];
    G --> H[End];
    `,
    stats: {
      likes: 340,
      saves: 150,
      solutions: { c: 2, cpp: 45, py: 103 },
    },
    comments: [
      { id: '1', author: 'string_ninja', avatar: '🥷', text: 'The Python one-liner is so cool! ✨', timestamp: '5 days ago' },
    ],
  },
  {
    id: 'factorial-of-a-number',
    title: 'Factorial of a Number',
    description: 'Calculate the factorial of a non-negative integer. The factorial is the product of all positive integers up to that number. Often solved using recursion or iteration.',
    tags: ['recursion', 'math', 'factorial', 'medium'],
    code: {
      c: `
#include <stdio.h>

long long factorial(int n) {
    if (n >= 1)
        return n * factorial(n - 1);
    else
        return 1;
}

int main() {
    int n = 5;
    printf("Factorial of %d = %lld", n, factorial(n));
    return 0;
}
      `,
    },
    flowchart: `
graph TD
    subgraph factorial(n)
        F1{n >= 1?}
        F1 -- Yes --> F2[return n * factorial(n-1)]
        F1 -- No --> F3[return 1]
    end
    A[Start] --> B{Input number n};
    B --> C[Call factorial(n)];
    C --> D{Output result};
    D --> E[End];
    `,
    stats: {
      likes: 210,
      saves: 88,
      solutions: { c: 30, cpp: 22, py: 50 },
    },
    comments: [],
  },
];

export function getProblems(): Problem[] {
  return problems;
}

export function getProblemById(id: string): Problem | undefined {
  return problems.find((p) => p.id === id);
}
