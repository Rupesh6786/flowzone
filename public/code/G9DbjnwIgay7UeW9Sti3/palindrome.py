
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

s = input("Enter a string: ")
if is_palindrome(s):
    print("Is Palindrome")
else:
    print("Not a Palindrome")
