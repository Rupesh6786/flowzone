#include<iostream>
using namespace std;

//++ Function to check the Number is Even or Odd
void check_even(int num){
    if( num == 0 ){
        cout<<"The Given Number is Zero"<<endl;
    }else if( num % 2 == 0){
        cout<<num<<" is Even"<<endl;
    }else{
        cout<<num<<" is Odd"<<endl;
    }
}

int main(){
    int num;
    cout<<"Enter the Number:";
    cin>>num;
    check_even(num);
    return 0;
}