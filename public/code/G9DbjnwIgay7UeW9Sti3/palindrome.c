#include <stdio.h>
#include <string.h>

int isPalindrome(char str[]) {
    int left = 0;
    int right = strlen(str) - 1;
    while (left < right) {
        if (str[left] != str[right]) {
            return 0; // Not a palindrome
        }
        left++;
        right--;
    }
    return 1; // Is a palindrome
}

int main() {
    char str[100];
    printf("Enter a string: ");
    scanf("%s", str);
    if (isPalindrome(str)) {
        printf("Is Palindrome\n");
    } else {
        printf("Not a Palindrome\n");
    }
    return 0;
}
