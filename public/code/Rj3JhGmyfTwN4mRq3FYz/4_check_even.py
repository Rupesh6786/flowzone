# Function to Check the number is Even or Odd
def check_even(num):
    if num == 0:
        print("The Given Number is zero")
    elif num % 2 == 0:
        print(f"{num} is Even")
    else:
        print(f"{num} is Odd")
    
# Get user input an number
num = int(input("Enter the Number:"))
check_even(num)