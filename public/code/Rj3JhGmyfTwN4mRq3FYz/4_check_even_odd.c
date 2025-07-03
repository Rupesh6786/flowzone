#include<stdio.h>

//++ Function to check the Number is Even or Odd
void check_even(int num){
    if( num == 0 ){
        printf("The Given Number is Zero");
    }else if( num % 2 == 0){
        printf("%d is Even",num);
    }else{
        printf("%d is Odd",num);
    }
}

int main(){
    int num ;
    printf("Enter the Number:");
    scanf("%d",&num);
    check_even(num);
    return 0;
}