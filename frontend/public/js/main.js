document.addEventListener('DOMContentLoaded', () => {
    const showSignUpBtn = document.getElementById('showSignUp');
    const showSignInBtn = document.getElementById('showSignIn');
    const signInPanel = document.querySelector('.sign-in-panel');
    const signUpPanel = document.querySelector('.sign-up-panel');

    showSignUpBtn.addEventListener('click', () => {
        // Sign in panel exits upwards
        signInPanel.classList.remove('active');
        signInPanel.classList.add('exit');
        
        // Sign up panel enters from below
        signUpPanel.classList.remove('exit');
        signUpPanel.classList.add('active');
    });

    showSignInBtn.addEventListener('click', () => {
        // Sign up panel exits upwards
        signUpPanel.classList.remove('active');
        signUpPanel.classList.add('exit');
        
        // Sign in panel enters from below
        signInPanel.classList.remove('exit');
        signInPanel.classList.add('active');
    });
});
