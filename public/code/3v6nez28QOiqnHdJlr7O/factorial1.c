#include<stdio.h>

//function to cal the factorial
int factorial(int num){
    int fact = 1;
    for(int i=1;i<=num;i++){
        fact*=i;
    }
    return fact;
}
int main(){
    int num=5;
    printf("factorial of %d is %d",num,factorial(num));
}