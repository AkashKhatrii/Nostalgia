const ham_button = document.getElementById('menu')
const navB = document.getElementById('mainnav')
const userBtn = document.getElementById('user-btn')
const userLinks = document.getElementById('user-btns')
console.log(ham_button)
console.log(navB)

navB.style.left = '-500px'
userLinks.style.right = '-300px'

ham_button.addEventListener("click",() => {
    console.log("clicked");
    console.log(navB.style.left)
    if ( navB.style.left == '-500px'){
        navB.style.left = '0';
    }
    else{
        navB.style.left = '-500px'
    }
})

userBtn.addEventListener("click", () =>{
    console.log("User Clicked")
    if ( userLinks.style.right == '-300px'){
        console.log("In if")
        userLinks.style.right = '0';
    }
    else{
        console.log("In Else")
        userLinks.style.right = '-300px'
    }
} )