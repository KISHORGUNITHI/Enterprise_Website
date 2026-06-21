document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("authContainer");
    const signUpBtn = document.getElementById("signUp");
    const signInBtn = document.getElementById("signIn");
    const mobileSignUpBtn = document.getElementById("mobileSignUp");
    const mobileSignInBtn = document.getElementById("mobileSignIn");

    if (signUpBtn) {
        signUpBtn.addEventListener("click", () => {
            container.classList.add("right-panel-active");
        });
    }

    if (signInBtn) {
        signInBtn.addEventListener("click", () => {
            container.classList.remove("right-panel-active");
        });
    }

    if (mobileSignUpBtn) {
        mobileSignUpBtn.addEventListener("click", () => {
            container.classList.add("right-panel-active");
        });
    }

    if (mobileSignInBtn) {
        mobileSignInBtn.addEventListener("click", () => {
            container.classList.remove("right-panel-active");
        });
    }
});
