#include<iostream>
using namespace std;

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
    cout<<"factorial of"<<num<<" is "<<factorial(num);
}