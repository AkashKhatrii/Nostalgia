const ham_button = document.getElementById('menu')
const navB = document.getElementById('mainnav')
console.log(ham_button)
console.log(navB)

navB.style.left = '-500px'

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
