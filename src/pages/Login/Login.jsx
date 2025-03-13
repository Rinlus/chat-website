import React from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { useState } from 'react'
import { signup, login, resetPass } from '../../config/firebase.js'

const Login = () => {

  /* the useState is a hook that was called from the react library that was installed in the project folder as a dependency 
     it is a function used to set values for an array variable */
  const [currState, setCurrState] = useState('Sign Up, bro!');
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault(); // does not refresh the page when form is use
    if (currState === 'Sign Up, bro!') {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="" className="logo" />
      <form onSubmit={onSubmitHandler} action="" className="login-form">
        <h2> {currState} </h2>
        {currState === 'Sign Up, bro!' ? <input onChange={(e) => setUserName(e.target.value)} value={userName} type="text" placeholder='Username' className="form-input" required /> : null}
        <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Email' className="form-input" required />
        <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" className="form-input" required />
        <button type="submit" > {currState === 'Sign Up, bro!' ? 'Create za account' : 'Login now, fam!'} </button>
        <div className="login-term">
          <input type="checkbox" />
          <p> Agree to the terms of use & privacy policy </p>
        </div>
        <div className="login-forgot">
          {currState === 'Sign Up, bro!'
            ? <p className="login-toggle"> oh, soory, need an account <span onClick={() => setCurrState("Login")}> Ok, Login </span> </p>
            : <p className="login-toggle"> Already have an account? <span onClick={() => setCurrState("Sign Up, bro!")}> Click here, brother! </span> </p>}
          {currState === 'Login' ? <p className="login-toggle"> Forgot Password? <span onClick={() => resetPass(email)}> Reset here, Mate </span> </p> : null}
        </div>
      </form>
    </div>
  )
}

export default Login